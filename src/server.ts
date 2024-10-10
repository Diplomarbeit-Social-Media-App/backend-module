import express, { json, urlencoded } from "express";
import cors from "cors";
import allRoutes from "./routes";
import { convertError, handleError } from "./middlewares/error";
import { notFound } from "./middlewares/not-found";
import morgan from "./middlewares/morgan";

const app = express();

app.use(cors());
app.use(urlencoded({ extended: false }));
app.use(json());
app.use(morgan);
app.use(allRoutes);
app.use(notFound);
app.use(convertError);
app.use(handleError);

export default app;
