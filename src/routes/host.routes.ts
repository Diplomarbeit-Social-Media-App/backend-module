import { Router } from 'express';
import controllers from '../controllers';
import { validate } from '../middlewares/validation';
import {
  hostAddSocialSchema,
  hostDelSocialSchema,
  hostDetailsSchema,
  hostRatingDeletionSchema,
  hostRatingSchema,
  hostSubscriptionSchema,
} from '../schema/host';
const router = Router();

router.get(
  '/details/:userName',
  [validate(hostDetailsSchema)],
  controllers.host.getHostDetails,
);
router.post(
  '/rate',
  [validate(hostRatingSchema)],
  controllers.host.postHostRating,
);
router.delete(
  '/rate/:hId',
  [validate(hostRatingDeletionSchema)],
  controllers.host.deleteHostRating,
);
router.post(
  '/social',
  [validate(hostAddSocialSchema)],
  controllers.host.postAddSocial,
);
router.delete(
  '/social/:type',
  [validate(hostDelSocialSchema)],
  controllers.host.deleteHostSocial,
);
router.post(
  '/subscribe/:hId',
  [validate(hostSubscriptionSchema)],
  controllers.host.postSubscribeHost,
);
router.delete(
  '/subscribe/:hId',
  [validate(hostSubscriptionSchema)],
  controllers.host.deleteSubscribeHost,
);

export default router;
