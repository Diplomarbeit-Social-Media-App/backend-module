import { Router } from 'express';
import { validate } from '../../middlewares/validation';
import { getAboSchema, postAboSchema, searchSchema } from '../../schema/abo';
import {
  getAboRequests,
  getSearchByUserName,
  postAboRequests,
} from '../../controllers/abo';

const router = Router();
export default router;

router.get('/:filter', [validate(getAboSchema)], getAboRequests);
router.post('/', [validate(postAboSchema)], postAboRequests);
router.get('/search/:userName', [validate(searchSchema)], getSearchByUserName);
