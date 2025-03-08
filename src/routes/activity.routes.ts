import { Router } from 'express';
import controllers from '../controllers';
import { hasHostPermission, hasValidAccunt } from '../middlewares/permission';
import {
  createActivitySchema,
  deleteActivitySchema,
} from '../schema/activity.schema';
import { validate } from '../middlewares/validation';
const router = Router();

router.get('/', hasValidAccunt, controllers.activity.getTrendingActivities);
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
