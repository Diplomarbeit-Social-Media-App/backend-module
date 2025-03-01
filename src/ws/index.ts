import io from 'socket.io';
import http from 'http';
import logger from '../logger';
import { createAdapter } from '@socket.io/redis-adapter';

export const initializeWebSocket = (
  server: http.Server,
  pubClient: unknown,
  subClient: unknown,
  ...middlewares: ((
    socket: io.Socket,
    next: (err?: io.ExtendedError | undefined) => void,
  ) => void)[]
) => {
  const ws = new io.Server(server, {
    cors: { origin: '*' },
  });

  ws.adapter(createAdapter(pubClient, subClient));

  middlewares.forEach((m) => ws.use(m));

  logger.info('✅ WebSocket initialized');

  return ws;
};
