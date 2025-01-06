import { Router } from 'express';
import controllers from '../../controllers';
import { hasHostPermission } from '../../middlewares/permission';
import { createActivitySchema } from '../../schema/activity';
import { validate } from '../../middlewares/validation';
const router = Router();

router.get('/', controllers.activity.getAllActivities);
router.post(
  '/',
  [hasHostPermission, validate(createActivitySchema)],
  controllers.activity.postCreateActivity,
);

export default router;
