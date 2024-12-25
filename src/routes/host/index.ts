import { Router } from 'express';
import controllers from '../../controllers';
import { validate } from '../../middlewares/validation';
import { hostDetailsSchema, hostRatingSchema } from '../../schema/host';
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

export default router;
