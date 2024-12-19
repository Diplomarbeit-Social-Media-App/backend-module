import { Router } from 'express';
import { validate } from '../../middlewares/validation';
import { getAboSchema, postAboSchema } from '../../schema/abo';
import { getAboRequests, postAboRequests } from '../../controllers/abo';

const router = Router();
export default router;

router.get('/:filter', [validate(getAboSchema)], getAboRequests);
router.post('/', [validate(postAboSchema)], postAboRequests);
