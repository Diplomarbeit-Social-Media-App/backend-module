import { Router } from 'express';
import { validate } from '../../middlewares/validation';
import { getAboSchema } from '../../schema/abo';
import { getAboRequests } from '../../controllers/abo';

const router = Router();
export default router;

router.get('/:filter', [validate(getAboSchema)], getAboRequests);
