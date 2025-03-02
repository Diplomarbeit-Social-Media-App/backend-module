import app from '../config/firebase';

const messaging = app().messaging();

export const sendNotification = (
  title: string,
  body: string,
  isGroupMessage: boolean,
  token: string,
) => {
  return messaging.send({
    token,
    data: { title, body, isGroupMessage: String(isGroupMessage) },
  });
};

export const sendNotifications = (
  title: string,
  body: string,
  isGroupMessage: boolean,
  ...tokens: string[]
) => {
  return messaging.sendEachForMulticast({
    tokens,
    data: { title, body, isGroupMessage: String(isGroupMessage) },
  });
};
