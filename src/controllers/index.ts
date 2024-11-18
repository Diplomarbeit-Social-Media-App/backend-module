import * as authController from './auth';
import * as eventController from './events';
import * as healthController from './health';
import * as groupController from './group';

const controllers = {
  auth: authController,
  events: eventController,
  groups: groupController,
  health: healthController,
};

export default controllers;
