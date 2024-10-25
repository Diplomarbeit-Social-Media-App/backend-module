import { Router } from "express";
import { getHealthCheck } from "../../controllers/health";
const router = Router();

router.get("/", getHealthCheck);

export default router;
