import express from "express";
import "tsconfig-paths/register";
import { cpus } from "os";

import allRoutes from "@routes/index";
import { getHealthCheck } from "@utils/db-util";
import { ApiError } from "@utils/api-error-util";
import { handleSevereErrors } from "@middlewares/error";
import logger from "@logger/logger";
import config from "@config/config";

process.env.UV_THREADPOOL = `${cpus.length}`;
const PORT = config.PORT;

const app = express();

export const server = app.listen(PORT, async () => {
  const health = await getHealthCheck();
  if (!health) throw new ApiError(500, "CONNECTION TO DATABASE FAILED!", false);

  logger.info("✨ SERVICE CONNECTED TO DB");
  logger.info(`🚀 REST SERVICE SUCCESFULLY STARTED ON PORT ${PORT}`);
});

process.on("uncaughtException", () => handleSevereErrors());
process.on("unhandledRejection", () => handleSevereErrors());

app.use(allRoutes);
