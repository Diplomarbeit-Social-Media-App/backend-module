import { Router } from 'express';
import authRoutes from './auth.routes';
import eventRoutes from './event.routes';
import healthRoutes from './health.routes';
import aboRoutes from './abo.routes';
import hostRoutes from './host.routes';
import activityRoutes from './activity.routes';
import notificationRoutes from './notification.routes';
import groupRoutes from './group.routes';
import adminRoutes from './admin.routes';
import { hasValidAccount, isAdmin } from '../middlewares/permission';

const allRoutes = Router();

allRoutes.use('/auth', authRoutes);
allRoutes.use('/health', healthRoutes);

allRoutes.use(hasValidAccount);
allRoutes.use('/event', eventRoutes);
allRoutes.use('/abo', aboRoutes);
allRoutes.use('/host', hostRoutes);
allRoutes.use('/activity', activityRoutes);
allRoutes.use('/notification', notificationRoutes);
allRoutes.use('/group', groupRoutes);
allRoutes.use('/admin', isAdmin, adminRoutes);

export default allRoutes;
