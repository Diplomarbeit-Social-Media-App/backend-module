import { postNotificationSchema } from '../schema/admin.schema';

type adminNotificationBody = typeof postNotificationSchema.shape.body;
export type adminNotificationType = Zod.infer<adminNotificationBody>;
