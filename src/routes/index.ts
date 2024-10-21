import { Router } from "express";
import authRoutes from "./auth";

const allRoutes = Router();

allRoutes.use("/auth", authRoutes)

export default allRoutes;