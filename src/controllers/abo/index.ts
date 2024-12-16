import { Request } from 'express';
import { ABO_FILTER_SCHEMA, getAboType } from '../../types/abo';
import catchAsync from '../../utils/catchAsync';
import service from '../../services';

export const getAboRequests = catchAsync(
  async (req: Request<object, object, getAboType>, res, _next) => {
    const { filter } = req.body;
    const aboRequests = await service.abo.loadAboRequests(
      filter as ABO_FILTER_SCHEMA,
    );
    return res.status(200).json({ requests: aboRequests });
  },
);
