import schema from '../schema';

type postNotificationBody =
  typeof schema.notification.postNotificationTokenSchema.shape.body;
export type postNotificationType = Zod.infer<postNotificationBody>;
