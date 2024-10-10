import { format, createLogger, transports } from "winston";
import config from "../config/config";

const jsonFormat = format.json();
const consoleFormat = format.prettyPrint({ colorize: true, depth: 4 });

const combinedLogLevel = config.NODE_ENV === "development" ? "debug" : "info";

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
      format: consoleFormat,
      level: combinedLogLevel,
    }),
  ],
});

export default logger;
