import { Router } from 'express';
import controllers from '../controllers';

const router = Router();
export default router;

router.post('/token', controllers.notification.postNotificationToken);
