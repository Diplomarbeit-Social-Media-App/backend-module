import { Router } from 'express';
import controllers from '../../controllers';
import { validate } from '../../middlewares/validation';
import { createGroupSchema } from '../../schema/group';
const router = Router();

router.post('/', [validate(createGroupSchema)], controllers.groups.postGroup);

export default router;
