import schema from '../schema';

export type BaseNotification = {
  nId: number;
  timeStamp: number;
  seen: boolean;
};

export type NotificationUserInfo = {
  uId: number;
  aId: number;
  userName: string;
};

export type NotificationEventHostInfo = {
  hId: number;
  aId: number;
  companyName: string;
  userName: string;
};

export type NotificationEventInfo = {
  eId: number;
  postCode: number;
  city: string;
  startDate: string;
  name: string;
  description: string;
};

export type NotificationFriendRequest = BaseNotification & NotificationUserInfo;

export type NotificationGroupInfo = {
  gId: number;
  name: string;
  memberCount: string;
};

export type NotificationGroupInvitation = BaseNotification &
  NotificationUserInfo &
  NotificationGroupInfo;

export type NotificationEventPublication = BaseNotification &
  NotificationEventHostInfo &
  NotificationEventInfo;

export interface NotificationResponse {
  incomingFriendRequests: NotificationFriendRequest[];
  acceptedFriendRequests: NotificationFriendRequest[];
  groupInvitations: NotificationGroupInvitation[];
  publishedEvents: NotificationEventPublication[];
}

type postNotificationBody =
  typeof schema.notification.postNotificationTokenSchema.shape.body;
export type postNotificationType = Zod.infer<postNotificationBody>;
