import { Router } from 'express';
import { validate } from '../middlewares/validation';
import {
  loginSchema,
  passwordResetSchema,
  renewTokenSchema,
  requestPasswordResetSchema,
  signUpSchema,
  updateAccountSchema,
} from '../schema/auth.schema';
import controllers from '../controllers/index';
import { auth } from '../middlewares/auth';
import { hasBlockedAccount, hasValidAccunt } from '../middlewares/permission';
const router = Router();

router.post('/login', validate(loginSchema), controllers.auth.postLogin);
router.post('/signup', validate(signUpSchema), controllers.auth.postSignUp);
router.post(
  '/renew',
  validate(renewTokenSchema),
  controllers.auth.postRenewToken,
);
router.get('/type', [auth], controllers.auth.getAccountType);
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
router.post('/logout', [auth], controllers.auth.postLogout);
router.get('/profile', hasValidAccunt, controllers.auth.getProfileDetails);
router.put('/picture', hasValidAccunt, controllers.auth.putProfilePicture);
router.post(
  '/activate',
  [auth, hasBlockedAccount],
  controllers.auth.postVerifyAccount,
);
router.get(
  '/activate',
  [auth, hasBlockedAccount],
  controllers.auth.getVerifyAccount,
);
router.delete('/', [auth], controllers.auth.deleteAccount);
router.put(
  '/account',
  hasValidAccunt,
  [validate(updateAccountSchema)],
  controllers.auth.updateAccountData,
);

export default router;
