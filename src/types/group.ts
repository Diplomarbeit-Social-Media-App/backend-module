import {
  createGroupSchema,
  generalEditGroupSchema,
  groupIdOnlySchema,
  inviteAcceptGroupSchema,
  inviteGroupSchema,
  postAttachPublicEventSchema,
  kickUserGroupSchema,
} from '../schema/group.schema';
import { BasicAccountRepresentation } from './abo';

export type BasicGroupMemberPresentation = BasicAccountRepresentation & {
  isAdmin: boolean;
};

type createGroupBody = typeof createGroupSchema.shape.body;
export type createGroupType = Zod.infer<createGroupBody>;

type inviteGroupBody = typeof inviteGroupSchema.shape.body;
export type inviteGroupType = Zod.infer<inviteGroupBody>;

type inviteAcceptGroupBody = typeof inviteAcceptGroupSchema.shape.body;
export type inviteAcceptType = Zod.infer<inviteAcceptGroupBody>;

type groupIdOnlyParams = typeof groupIdOnlySchema.shape.params;
export type groupIdOnlyType = Zod.infer<groupIdOnlyParams>;

type generalEditGroupBody = typeof generalEditGroupSchema.shape.body;
export type generalEditGroupType = Zod.infer<generalEditGroupBody>;

type postAttachPublicEventBody = typeof postAttachPublicEventSchema.shape.body;
export type attachPublicEventType = Zod.infer<postAttachPublicEventBody>;

type kickUserGroupQuery = typeof kickUserGroupSchema.shape.query;
export type kickUserGroupType = Zod.infer<kickUserGroupQuery>;
