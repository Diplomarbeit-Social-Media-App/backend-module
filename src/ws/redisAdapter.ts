import { createClient } from 'redis';
import config from '../config/config';
import logger from '../logger';

const { REDIS_URL, REDIS_PORT, REDIS_PWD, REDIS_USER } = config;

export const initialiseAdapter = async () => {
  const pubClient = createClient({
    username: REDIS_USER,
    password: REDIS_PWD,
    socket: {
      host: REDIS_URL,
      port: REDIS_PORT,
    },
  });

  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);

  logger.info('✔ Redis clients connected');

  return { pubClient, subClient };
};
