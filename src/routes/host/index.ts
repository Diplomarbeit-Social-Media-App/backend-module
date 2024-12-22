import { Router } from 'express';
import controllers from '../../controllers';
import { validate } from '../../middlewares/validation';
import { hostDetailsSchema } from '../../schema/host';
const router = Router();

router.get(
  '/details/:userName',
  [validate(hostDetailsSchema)],
  controllers.host.getHostDetails,
);

export default router;
