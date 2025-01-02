import { Router } from 'express';
import authRoutes from './auth';
import eventRoutes from './events';
import healthRoutes from './health';
import aboRoutes from './abo';
import hostRoutes from './host';
import activityRoutes from './activities';
import { hasValidAccunt } from '../middlewares/permission';

const allRoutes = Router();

allRoutes.use('/auth', authRoutes);
allRoutes.use('/health', healthRoutes);
allRoutes.use('/event', hasValidAccunt, eventRoutes);
allRoutes.use('/abo', hasValidAccunt, aboRoutes);
allRoutes.use('/host', hasValidAccunt, hostRoutes);
allRoutes.use('/activity', hasValidAccunt, activityRoutes);

export default allRoutes;
