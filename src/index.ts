import { cpus } from 'os';
import { getHealthCheck } from './utils/db';
import { ApiError } from './utils/apiError';
import { handleSevereErrors } from './middlewares/error';
import logger from './logger/logger';
import config from './config/config';
import app from './server';

process.env.UV_THREADPOOL = `${cpus.length}`;
const PORT = config.PORT;

export const server = app.listen(PORT, async () => {
  const health = await getHealthCheck();
  if (!health) throw new ApiError(500, 'CONNECTION TO DATABASE FAILED!', false);

  logger.info('✨ SERVICE CONNECTED TO DB');
  logger.info(
    `🚀 REST SERVICE SUCCESFULLY STARTED ON http://localhost:${PORT}/`,
  );
});

process.on('uncaughtException', (e: Error) => handleSevereErrors(e.message));
process.on('unhandledRejection', (reason: Error) =>
  handleSevereErrors(`${reason?.message}|${reason?.name}`),
);
