import { Router } from 'express';
import controllers from '../controllers';
import { hasHostPermission } from '../middlewares/permission';
import {
  createActivitySchema,
  deleteActivitySchema,
} from '../schema/activity';
import { validate } from '../middlewares/validation';
const router = Router();

router.get('/', controllers.activity.getAllActivities);
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
