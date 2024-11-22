import { Router } from 'express';
import { validate } from '../../middlewares/validation';
import {
  loginSchema,
  passwordResetSchema,
  renewTokenSchema,
  requestPasswordResetSchema,
  signUpSchema,
} from '../../schema/auth';
import controllers from '../../controllers/index';
const router = Router();

router.post('/login', validate(loginSchema), controllers.auth.postLogin);
router.post('/signup', validate(signUpSchema), controllers.auth.postSignUp);
router.post(
  '/renew',
  validate(renewTokenSchema),
  controllers.auth.postRenewToken,
);
router.get(
  '/reset/:userName',
  validate(requestPasswordResetSchema),
  controllers.auth.postRequestResetPwdToken,
);
router.post(
  '/reset',
  validate(passwordResetSchema),
  controllers.auth.postResetPassword,
);

export default router;
