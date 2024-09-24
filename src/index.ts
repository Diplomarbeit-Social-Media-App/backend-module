import express from "express";
import env from "./utils/env-util";

const PORT = env.PORT;

const app = express();

app.listen(PORT, () =>
  console.log(`🚀 REST SERVICE SUCCESFULLY STARTED ON PORT ${PORT}`)
);
