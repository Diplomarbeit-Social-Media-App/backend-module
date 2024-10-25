import { Router } from "express";
import { getEvents, postEvent } from "../../controllers/events";
import { hasHostPermission } from "../../middlewares/permission";
const router = Router();

router.post("/", [hasHostPermission], postEvent);
router.get("/", getEvents);

export default router;
