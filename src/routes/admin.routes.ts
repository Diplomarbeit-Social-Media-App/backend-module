import { Router } from 'express';
import controllers from '../controllers';
import { validate } from '../middlewares/validation';
import {
  postNotificationSchema,
  userNameParamSchema,
} from '../schema/admin.schema';

const router = Router();
export default router;

router.post('/notification/:userName', [
  validate(postNotificationSchema),
  validate(userNameParamSchema),
  controllers.admin.postSendNotification,
]);
router.post(
  '/notification',
  [validate(postNotificationSchema)],
  controllers.admin.postBroadcastNotification,
);
