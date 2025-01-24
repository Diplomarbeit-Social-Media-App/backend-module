import { Router } from 'express';
import controllers from '../controllers';
import { validate } from '../middlewares/validation';
import { postNotificationTokenSchema } from '../schema/notification.schema';

const router = Router();
export default router;

router.post(
  '/token',
  [validate(postNotificationTokenSchema)],
  controllers.notification.postNotificationToken,
);
