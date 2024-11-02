import { Router } from "express";
import controllers from "../../controllers";
import { hasHostPermission } from "../../middlewares/permission";
import { eventSchema } from "../../schema/event";
import { validate } from "../../middlewares/validation";
const router = Router();

router.post(
  "/",
  [hasHostPermission, validate(eventSchema)],
  controllers.events.postEvent
);
router.get("/", controllers.events.getEvents);

export default router;
