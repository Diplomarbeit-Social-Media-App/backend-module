import express, { json, urlencoded } from "express";
import env from "./utils/env-util";
import { cpus } from "os";
import cors from "cors";
import allRoutes from "./routes/index";

process.env.UV_THREADPOOL = `${cpus.length}`;
const PORT = env.PORT;

const app = express();

export const server = app.listen(PORT, () =>
  console.log(`🚀 REST SERVICE SUCCESFULLY STARTED ON PORT ${PORT}`)
);

app.use(cors());
app.use(urlencoded({ extended: false }));
app.use(json());
app.use(allRoutes);