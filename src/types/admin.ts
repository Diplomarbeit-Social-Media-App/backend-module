import * as Zod from 'zod';
import {
  aIdParamsSchema,
  postNotificationSchema,
  userNameParamSchema,
} from '../schema/admin.schema';

type adminNotificationBody = typeof postNotificationSchema.shape.body;
export type adminNotificationType = Zod.infer<adminNotificationBody>;

type userNameParam = typeof userNameParamSchema.shape.params;
export type userNameType = Zod.infer<userNameParam>;

type aIdParams = typeof aIdParamsSchema.shape.params;
export type aIdType = Zod.infer<aIdParams>;

export type UserList = {
  aId: number;
  userName: string;
  email: string;
  role: string;
  isActivated: boolean;
  isVerified: boolean;
  isHost: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  joined: string;
}[];
