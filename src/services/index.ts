import * as userService from './user.service';
import * as tokenService from './token.service';
import * as accountService from './account.service';
import * as authService from './auth.service';
import * as eventService from './event.service';
import * as mailService from './mail.service';
import * as aboService from './abo.service';
import * as hostService from './host.service';
import * as activityService from './activity.service';
import * as groupService from './group.service';

const service = {
  user: userService,
  token: tokenService,
  account: accountService,
  auth: authService,
  event: eventService,
  mail: mailService,
  abo: aboService,
  host: hostService,
  activity: activityService,
  group: groupService,
};

export default service;
