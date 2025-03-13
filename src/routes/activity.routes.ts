import { Router } from 'express';
import controllers from '../controllers';
import { hasHostPermission, hasValidAccunt } from '../middlewares/permission';
import {
  activityIdOnlySchema,
  createActivitySchema,
  deleteActivitySchema,
  participationSchema,
} from '../schema/activity.schema';
import { validate } from '../middlewares/validation';
const router = Router();

router.get(
  '/search/:query',
  hasValidAccunt,
  controllers.activity.getUserSearch,
);
router.get(
  '/participating',
  hasValidAccunt,
  controllers.activity.getUserActivities,
);
router.get(
  '/:acId',
  hasValidAccunt,
  validate(activityIdOnlySchema),
  controllers.activity.getActivityDetail,
);
router.get('/', hasValidAccunt, controllers.activity.getTrendingActivities);
router.post(
  '/attendance',
  hasValidAccunt,
  validate(participationSchema),
  controllers.activity.postParticipateActivity,
);
router.post(
  '/',
  [hasHostPermission, validate(createActivitySchema)],
  controllers.activity.postCreateActivity,
);
router.delete(
  '/:aId',
  [hasHostPermission, validate(deleteActivitySchema)],
  controllers.activity.deleteActivity,
);

export default router;
