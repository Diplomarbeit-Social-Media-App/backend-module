import { Router } from 'express';
import controllers from '../controllers';
import { validate } from '../middlewares/validation';
import schema from '../schema';
const router = Router();

router.post(
  '/invite',
  [validate(schema.group.inviteGroupSchema)],
  controllers.group.postInviteGroup,
);
router.post(
  '/',
  [validate(schema.group.createGroupSchema)],
  controllers.group.postCreateGroup,
);
router.put(
  '/invite',
  [validate(schema.group.inviteAcceptGroupSchema)],
  controllers.group.putInviteAcceptGroup,
);
router.get(
  '/:gId',
  [validate(schema.group.groupIdOnlySchema)],
  controllers.group.getGroupData,
);
router.delete(
  '/:gId',
  [validate(schema.group.groupIdOnlySchema)],
  controllers.group.deleteGroup,
);

export default router;
