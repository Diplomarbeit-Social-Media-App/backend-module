import * as authController from './auth.control';
import * as eventController from './event.control';
import * as healthController from './health.control';
import * as groupController from './group.control';
import * as hostController from './host.control';
import * as activityController from './activity.control';
import * as aboController from './abo.control';

const controllers = {
  auth: authController,
  event: eventController,
  group: groupController,
  health: healthController,
  host: hostController,
  activity: activityController,
  abo: aboController,
};

export default controllers;
