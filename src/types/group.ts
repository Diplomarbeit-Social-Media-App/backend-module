import {
  createGroupSchema,
  groupIdOnlySchema,
  inviteAcceptGroupSchema,
  inviteGroupSchema,
} from '../schema/group.schema';

type createGroupBody = typeof createGroupSchema.shape.body;
export type createGroupType = Zod.infer<createGroupBody>;

type inviteGroupBody = typeof inviteGroupSchema.shape.body;
export type inviteGroupType = Zod.infer<inviteGroupBody>;

type inviteAcceptGroupBody = typeof inviteAcceptGroupSchema.shape.body;
export type inviteAcceptType = Zod.infer<inviteAcceptGroupBody>;

type groupIdOnlyParams = typeof groupIdOnlySchema.shape.params;
export type groupIdOnlyType = Zod.infer<groupIdOnlyParams>;
