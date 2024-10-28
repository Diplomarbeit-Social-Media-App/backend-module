import { Router } from "express";
import authRoutes from "./auth";
import eventRoutes from "./events";
import healthRoutes from "./health";
import { auth } from "../middlewares/auth";

const allRoutes = Router();

allRoutes.use("/auth", authRoutes);
allRoutes.use("/health", healthRoutes);
allRoutes.use("/event", [auth], eventRoutes);

export default allRoutes;
