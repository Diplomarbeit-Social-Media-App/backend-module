import { Router } from 'express';
import controllers from '../controllers';
import { hasHostPermission } from '../middlewares/permission';
import {
  attendanceSchema,
  eventSchema,
  nameSearchSchema,
  participationSchema,
  updateSchema,
} from '../schema/event';
import { validate } from '../middlewares/validation';
import { auth } from '../middlewares/auth';
const router = Router();

router.post(
  '/',
  [hasHostPermission, validate(eventSchema)],
  controllers.event.postEvent,
);
router.get('/', controllers.event.getEvents);
router.get('/filter', controllers.event.getEventsFilterCategory);
router.get('/participating', controllers.event.getParticipatingEvents);
router.get('/:eventId', controllers.event.getEventDetails);
router.put('/', [validate(updateSchema)], controllers.event.updateEvent);
router.get(
  '/name-search/:query',
  [auth, validate(nameSearchSchema)],
  controllers.event.getSearchByQuery,
);
router.post(
  '/participate',
  [validate(participationSchema)],
  controllers.event.postParticipateEvent,
);
router.get(
  '/attendance/:eId',
  [validate(attendanceSchema)],
  controllers.event.getAttendanceState,
);

export default router;
