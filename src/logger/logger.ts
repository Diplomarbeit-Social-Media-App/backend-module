import { format, createLogger, transports } from "winston";
import config from "../config/config";
const { combine, timestamp, label, printf } = format;

const jsonFormat = format.json();

const combinedLogLevel = config.NODE_ENV === "development" ? "debug" : "info";

const consoleFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: jsonFormat,
  transports: [
    new transports.File({
      filename: "./logs/error.log",
      level: "warn",
    }),
    new transports.File({
      filename: "./logs/combined.log",
      level: combinedLogLevel,
    }),
    new transports.Console({
      format: combine(
        label({ label: "REST-SERVICE" }),
        timestamp(),
        consoleFormat
      ),
      level: combinedLogLevel,
    }),
  ],
});

export default logger;
