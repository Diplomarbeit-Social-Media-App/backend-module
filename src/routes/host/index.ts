import { Router } from 'express';
import controllers from '../../controllers';
import { validate } from '../../middlewares/validation';
import {
  hostDetailsSchema,
  hostRatingDeletionSchema,
  hostRatingSchema,
} from '../../schema/host';
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
  '/rate',
  [validate(hostRatingDeletionSchema)],
  controllers.host.deleteHostRating,
);

export default router;
