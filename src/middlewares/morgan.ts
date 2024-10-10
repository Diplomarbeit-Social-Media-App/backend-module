import morgan from "morgan";
import config from "../config/config";
import fs from "fs";
import path from "path";

const logFilePath = path.join(__dirname, "../../logs/requests.log");

const logFormat = config.NODE_ENV === "development" ? "common" : "short";

if (!fs.existsSync(logFilePath)) {
  throw new Error("Please provide a dir /logs with 'requests.log' file!");
}

const requestLoggerStream = fs.createWriteStream(logFilePath, {
  flags: "a",
  encoding: "utf-8",
});

export default morgan(logFormat, {
  stream: requestLoggerStream,
});
