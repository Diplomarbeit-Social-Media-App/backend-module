import { Router } from 'express';
import controllers from '../../controllers';
const router = Router();

router.get('/', controllers.activity.getAllActivities);

export default router;
