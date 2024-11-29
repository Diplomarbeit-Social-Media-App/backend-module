import { Router } from 'express';
import controllers from '../../controllers';
import { hasHostPermission } from '../../middlewares/permission';
import {
  eventSchema,
  nameSearchSchema,
  updateSchema,
} from '../../schema/event';
import { validate } from '../../middlewares/validation';
import { auth } from '../../middlewares/auth';
const router = Router();

router.post(
  '/',
  [hasHostPermission, validate(eventSchema)],
  controllers.events.postEvent,
);
router.get('/', controllers.events.getEvents);
router.get('/filter', controllers.events.getEventsFilterCategory);
router.get('/:eventId', controllers.events.getEventDetails);
router.put('/', [validate(updateSchema)], controllers.events.updateEvent);
router.get(
  '/name-search/:query',
  [auth, validate(nameSearchSchema)],
  controllers.events.getSearchByQuery,
);

export default router;
