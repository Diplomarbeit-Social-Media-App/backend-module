import { Router } from 'express';
import { validate } from '../middlewares/validation';
import {
  getAboSchema,
  postAboSchema,
  requestStateSchema,
  searchSchema,
} from '../schema/abo';
import {
  getAboRequests,
  getSearchByUserName,
  postAboRequests,
  putRequestState,
  getSuggestions,
} from '../controllers/abo.control';

const router = Router();
export default router;

router.get('/suggestions', getSuggestions);
router.get('/:filter', [validate(getAboSchema)], getAboRequests);
router.post('/', [validate(postAboSchema)], postAboRequests);
router.get('/search/:userName', [validate(searchSchema)], getSearchByUserName);
router.put('/', [validate(requestStateSchema)], putRequestState);
