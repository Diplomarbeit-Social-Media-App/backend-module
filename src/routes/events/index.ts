import { Router } from "express";
import { getEvents, postEvent } from "../../controllers/events";
import { hasHostPermission } from "../../middlewares/permission";
import { eventSchema } from "../../schema/event-schema";
import { validate } from "../../middlewares/validation";
const router = Router();

router.post("/", [hasHostPermission, validate(eventSchema)], postEvent);
router.get("/", getEvents);

export default router;
