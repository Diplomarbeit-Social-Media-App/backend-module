import { Router } from 'express';
import authRoutes from './auth';
import eventRoutes from './events';
import healthRoutes from './health';
import aboRoutes from './abo';
import hostRoutes from './host';
import { auth } from '../middlewares/auth';

const allRoutes = Router();

allRoutes.use('/auth', authRoutes);
allRoutes.use('/health', healthRoutes);
allRoutes.use('/event', [auth], eventRoutes);
allRoutes.use('/abo', [auth], aboRoutes);
allRoutes.use('/host', [auth], hostRoutes);

export default allRoutes;
