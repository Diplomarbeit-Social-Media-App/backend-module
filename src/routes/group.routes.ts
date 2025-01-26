import { Router } from 'express';
import controllers from '../controllers';
import { validate } from '../middlewares/validation';
import { createGroupSchema } from '../schema/group.schema';
const router = Router();

router.post(
  '/',
  [validate(createGroupSchema)],
  controllers.group.postCreateGroup,
);

export default router;
