import { Router } from 'express';
import controllers from '../controllers';
import { validate } from '../middlewares/validation';
import schema from '../schema';
import { postAttachPublicEventSchema } from '../schema/group.schema';
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
  '/leave/:gId',
  validate(schema.group.groupIdOnlySchema),
  controllers.group.deleteLeaveGroup,
);
router.delete(
  '/:gId',
  [validate(schema.group.groupIdOnlySchema)],
  controllers.group.deleteGroup,
);
router.put(
  '/',
  [validate(schema.group.generalEditGroupSchema)],
  controllers.group.putEditGroup,
);
router.get('/', controllers.group.getUserGroups);

/**
 * Event/ Activity actions such as posting, reacting etc
 */
router.post(
  '/events',
  [validate(postAttachPublicEventSchema)],
  controllers.group.postAttachEvent,
);

export default router;
