import { Router } from 'express';
import controllers from '../controllers';
import { validate } from '../middlewares/validation';
import {
  aIdParamsSchema,
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
router.get('/users', controllers.admin.getUsers);
router.delete(
  '/users/:aId',
  [validate(aIdParamsSchema)],
  controllers.admin.deleteAccountByAId,
);
router.put(
  '/users/ban/:aId',
  [validate(aIdParamsSchema)],
  controllers.admin.putToggleBanAccount,
);
router.put(
  '/users/verify/:aId',
  [validate(aIdParamsSchema)],
  controllers.admin.putVerifyAccount,
);
