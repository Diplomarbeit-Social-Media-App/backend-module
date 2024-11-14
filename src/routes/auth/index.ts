import { Router } from 'express';
import { validate } from '../../middlewares/validation';
import { loginSchema, renewTokenSchema, signUpSchema } from '../../schema/auth';
import controllers from '../../controllers/index';
const router = Router();

router.post('/login', validate(loginSchema), controllers.auth.postLogin);
router.post('/signup', validate(signUpSchema), controllers.auth.postSignUp);
router.post(
  '/renew',
  validate(renewTokenSchema),
  controllers.auth.postRenewToken,
);
router.post('/reset', controllers.auth.postResetPassword);

export default router;
