import * as authController from './auth.control';
import * as eventController from './event.control';
import * as healthController from './health.control';
import * as groupController from './group.control';
import * as hostController from './host.control';
import * as activityController from './activity.control';
import * as aboController from './abo.control';
import * as notificationController from './notification.control';

const controllers = {
  auth: authController,
  event: eventController,
  group: groupController,
  health: healthController,
  host: hostController,
  activity: activityController,
  abo: aboController,
  notification: notificationController,
};

export default controllers;
