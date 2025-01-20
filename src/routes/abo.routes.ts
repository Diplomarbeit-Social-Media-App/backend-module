import { Router } from 'express';
import { validate } from '../middlewares/validation';
import {
  deleteAboSchema,
  deleteRequestSchema,
  getAboSchema,
  postAboSchema,
  requestStateSchema,
  searchSchema,
} from '../schema/abo.schema';
import {
  getAboRequests,
  getSearchByUserName,
  postAboRequests,
  putRequestState,
  getSuggestions,
} from '../controllers/abo.control';
import controllers from '../controllers';
import schema from '../schema';

const router = Router();
export default router;

router.get('/suggestions', getSuggestions);
router.get(
  '/v/:uId',
  [validate(schema.abo.getForeignProfileSchema)],
  controllers.abo.getForeignProfile,
);
router.get('/:filter', [validate(getAboSchema)], getAboRequests);
router.post('/', [validate(postAboSchema)], postAboRequests);
router.get('/search/:userName', [validate(searchSchema)], getSearchByUserName);
router.put('/', [validate(requestStateSchema)], putRequestState);
router.delete(
  '/req/:frId',
  [validate(deleteRequestSchema)],
  controllers.abo.deleteRequest,
);
router.delete('/:uId', [validate(deleteAboSchema)], controllers.abo.deleteAbo);
