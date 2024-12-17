import { Request } from 'express';
import { ABO_FILTER_SCHEMA } from '../../types/abo';
import catchAsync from '../../utils/catchAsync';
import service from '../../services';
import { Account } from '@prisma/client';

export const getAboRequests = catchAsync(async (req: Request, res, _next) => {
  const { filter } = req.params;
  const { aId } = req.user as Account;
  const aboRequests = await service.abo.loadAboRequests(
    filter as unknown as ABO_FILTER_SCHEMA,
    aId,
  );
  return res.status(200).json({ requests: aboRequests });
});
