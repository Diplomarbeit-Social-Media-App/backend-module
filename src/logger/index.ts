import { format, createLogger, transports } from 'winston';
import config from '../config/config';
const { combine, timestamp, label, printf, colorize } = format;

const jsonFormat = format.json();
const consoleLabel = label({ label: 'BD-01' });

const combinedLogLevel = config.NODE_ENV === 'development' ? 'debug' : 'info';

const consoleFormat = printf(({ level, message, label, timestamp }) => {
  return `[${label}] ${timestamp} | ${level}: ${message}`;
});

const logger = createLogger({
  format: jsonFormat,
  transports: [
    new transports.File({
      filename: './logs/error.log',
      level: 'warn',
    }),
    new transports.File({
      filename: './logs/combined.log',
      level: combinedLogLevel,
    }),
    new transports.Console({
      format: combine(
        consoleLabel,
        timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        consoleFormat,
        colorize({ all: true }),
      ),
      level: combinedLogLevel,
    }),
  ],
});

export default logger;
