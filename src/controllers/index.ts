import * as authController from './auth';
import * as eventController from './events';
import * as healthController from './health';
import * as groupController from './group';
import * as hostController from './host';
import * as activityController from './activities';

const controllers = {
  auth: authController,
  events: eventController,
  groups: groupController,
  health: healthController,
  host: hostController,
  activity: activityController,
};

export default controllers;
