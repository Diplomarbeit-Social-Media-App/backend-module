import { JwtPayload } from 'jsonwebtoken';
import { manualVerifyToken } from '../../middlewares/auth';
import { chatMessageSchema } from '../../schema/ws.schema';
import service from '../../services';
import { ApiError } from '../../utils/apiError';
import { CONFLICT, FORBIDDEN } from 'http-status';
import { ExtendedError, Server, Socket } from 'socket.io';
import logger from '../../logger';
import assert from 'assert';

type UserAuthData = {
  exp: number;
  uId: string | number;
  aId: string | number;
};

type UserRoom = {
  room: string | null;
};

export const initialiseChatNameSpace = (ws: Server) => {
  const chatSpace = ws.of('/chat');

  chatSpace.use(
    async (socket: Socket, next: (err?: ExtendedError | undefined) => void) => {
      try {
        const token =
          socket.handshake.auth?.access ||
          socket.handshake.headers?.authorization;

        if (!token) throw new ApiError(FORBIDDEN, 'Kein Token bereitgestellt');

        const verified = await manualVerifyToken(token);
        const payload = verified as JwtPayload;

        const user = await service.user.findUserByAId(Number(payload.sub));

        const auth: UserAuthData = {
          exp: payload.exp!,
          uId: user.uId,
          aId: user.aId,
        };
        const room: UserRoom = {
          room: null,
        };

        Object.assign(socket.data, { auth });
        Object.assign(socket.data, room);

        next();
      } catch (err) {
        next(err as Error);
      }
    },
  );

  chatSpace.on('connection', (socket: Socket) => {
    logger.debug(`User with uId ${socket.data.auth.uId} connected`);

    socket.on('join', async ({ gId }: { gId: number }) => {
      try {
        const userId = socket.data.auth.uId;

        const isAllowed = await service.group.isInvitedOrMember(gId, userId);
        if (!isAllowed.isMember)
          throw new ApiError(FORBIDDEN, 'Kein Zugriff auf diese Gruppe');

        const isConnectedRoom = socket.data.room;
        if (isConnectedRoom)
          throw new ApiError(
            CONFLICT,
            'Bereits zu einem anderen Chat verbunden',
          );

        socket.data.room = gId;
        socket.join(`group-${gId}`);

        logger.debug(`👥 User ${userId} ist Chatraum ${gId} beigetreten`);
      } catch (e) {
        const error: Error = e as Error;
        logger.debug(`Error trying to join chat, ${error.message}`);
        socket.emit('error', error.message);
      }
    });

    socket.on('message', async (data: unknown) => {
      try {
        const { message } = chatMessageSchema.parse(data);
        const userId = socket.data.auth.uId;
        const room = socket.data.room;

        assert(room, new ApiError(CONFLICT, 'Betritt zuerst einen Chat-Raum'));

        const groupMsg = await service.group.sendMessage(userId, room, message);
        chatSpace.to(`group-${room}`).emit('message', groupMsg);

        logger.debug(
          `new message to room 'group-${room}': '${message} from userId '${userId}'`,
        );
      } catch (e) {
        socket.emit('error', (e as Error).message);
      }
    });

    socket.on('leave', async () => {
      try {
        const userId = socket.data.auth.uId;
        const room = socket.data.room;

        if (!room) throw new ApiError(CONFLICT, 'Zu keinem Raum verbunden');

        await service.group.updateReadTimeStamp(userId, room);
        socket.leave(`group-${room}`);

        console.log(`🔴 User ${userId} hat Chatraum ${room} verlassen`);
      } catch (e) {
        socket.emit('error', (e as Error).message);
      } finally {
        socket.data.room = null;
      }
    });

    socket.on('disconnect', async () => {
      logger.debug(`🔴 User ${socket.data.auth.uId} getrennt`);
      const uId = socket.data.auth.uId;
      const room = socket.data.room;
      if (!uId || !room) return;
      try {
        await service.group.updateReadTimeStamp(uId, room);
      } catch {
        logger.error(
          `Failed to update timestamp on userId ${uId}, gId ${room}`,
        );
      }
    });
  });

  logger.info('✅ Chat-Namespace eingerichtet');
};
