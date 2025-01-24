import { Router } from 'express';
import authRoutes from './auth.routes';
import eventRoutes from './event.routes';
import healthRoutes from './health.routes';
import aboRoutes from './abo.routes';
import hostRoutes from './host.routes';
import activityRoutes from './activity.routes';
import notificationRoutes from './notification.routes';
import { hasValidAccunt } from '../middlewares/permission';

const allRoutes = Router();

allRoutes.use('/auth', authRoutes);
allRoutes.use('/health', healthRoutes);
allRoutes.use('/event', hasValidAccunt, eventRoutes);
allRoutes.use('/abo', hasValidAccunt, aboRoutes);
allRoutes.use('/host', hasValidAccunt, hostRoutes);
allRoutes.use('/activity', hasValidAccunt, activityRoutes);
allRoutes.use('/notification', hasValidAccunt, notificationRoutes);

export default allRoutes;
