import { Router } from 'express';
import controllers from '../../controllers';
import { hasHostPermission } from '../../middlewares/permission';
import { eventSchema } from '../../schema/event';
import { validate } from '../../middlewares/validation';
const router = Router();

router.post(
  '/',
  [hasHostPermission, validate(eventSchema)],
  controllers.events.postEvent,
);
router.get('/', controllers.events.getEvents);
router.get('/filter', controllers.events.getEventsFilterCategory);
router.get('/:eventId', controllers.events.getEventDetails);

export default router;
