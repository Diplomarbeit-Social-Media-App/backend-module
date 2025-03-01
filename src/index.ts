import http from 'http';
import { cpus } from 'os';
import { INTERNAL_SERVER_ERROR } from 'http-status';
import { getHealthCheck } from './utils/db';
import { ApiError } from './utils/apiError';
import { handleSevereErrors } from './middlewares/error';
import logger from './logger';
import config from './config/config';
import app from './server';
import firebase from './config/firebase';
import { initialiseAdapter } from './ws/redisAdapter';
import { initializeWebSocket } from './ws';
import { initialiseChatNameSpace } from './ws/chat';

const server = http.createServer(app);

process.env.UV_THREADPOOL = `${cpus.length}`;
const PORT = config.PORT;

server.listen(PORT, async () => {
  const dbHealth = await getHealthCheck();
  if (!dbHealth)
    throw new ApiError(INTERNAL_SERVER_ERROR, 'DB connection failed', false);
  firebase();

  const clients = await initialiseAdapter();
  const ws = initializeWebSocket(server, clients.pubClient, clients.subClient);
  initialiseChatNameSpace(ws);

  logger.info('✨ Database initialized');
  logger.info(`🚀 Service started on PORT :${PORT}`);
});

process.on('uncaughtException', (e: Error) => handleSevereErrors(e));
process.on('unhandledRejection', (e: Error) => handleSevereErrors(e));
