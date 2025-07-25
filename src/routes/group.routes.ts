import { Router } from 'express';
import controllers from '../controllers';
import { validate } from '../middlewares/validation';
import schema from '../schema';
import {
  attendancePrivateEventSchema,
  groupIdOnlySchema,
  postAttachPublicEventSchema,
  privateEventSchema,
} from '../schema/group.schema';
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
  '/friends/:gId',
  [validate(schema.group.groupIdOnlySchema)],
  controllers.group.getFriendsNotInGroup,
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
  '/kick',
  validate(schema.group.kickUserGroupSchema),
  controllers.group.deleteKickUser,
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
router.get(
  '/chat/:gId',
  [validate(groupIdOnlySchema)],
  controllers.group.getChatInformations,
);
router.get('/', controllers.group.getUserGroups);

/**
 * Event actions such as posting, reacting etc
 */
router.post(
  '/events',
  [validate(postAttachPublicEventSchema)],
  controllers.group.postAttachEvent,
);

router.get(
  '/events/:gId',
  [validate(groupIdOnlySchema)],
  controllers.group.getAttachedEvents,
);

router.post(
  '/events/new',
  [validate(privateEventSchema)],
  controllers.group.postPrivateEvent,
);

router.post(
  '/attendance',
  [validate(attendancePrivateEventSchema)],
  controllers.group.postParticipatePrivateEvent,
);

export default router;
