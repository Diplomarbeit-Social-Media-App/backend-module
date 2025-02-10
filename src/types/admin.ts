import {
  postNotificationSchema,
  userNameParamSchema,
} from '../schema/admin.schema';

type adminNotificationBody = typeof postNotificationSchema.shape.body;
export type adminNotificationType = Zod.infer<adminNotificationBody>;

type userNameParam = typeof userNameParamSchema.shape.params;
export type userNameType = Zod.infer<userNameParam>;
