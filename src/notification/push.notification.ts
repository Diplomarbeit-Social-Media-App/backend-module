import app from '../config/firebase';

const messaging = app().messaging();

export const sendNotification = (
  title: string,
  body: string,
  token: string,
) => {
  return messaging.send({ token, data: { title, body } });
};

export const sendNotifications = (
  title: string,
  body: string,
  ...tokens: string[]
) => {
  messaging.sendEachForMulticast({ tokens, data: { title, body } });
};
