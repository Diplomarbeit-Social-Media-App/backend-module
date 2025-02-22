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
import * as notificationService from './notification.service';
import * as adminService from './admin.service';
import * as locationService from './location.service';
import * as friendshipService from './friend.service';
import * as messageService from './message.service';

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
  notification: notificationService,
  admin: adminService,
  loc: locationService,
  friend: friendshipService,
  message: messageService,
};

export default service;
