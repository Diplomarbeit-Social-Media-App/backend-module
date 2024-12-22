import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { hostDetailsType } from '../../types/host';
import service from '../../services';
import { OK } from 'http-status';

export const getHostDetails = catchAsync(
  async (req: Request<hostDetailsType>, res: Response, _next: NextFunction) => {
    const { userName } = req.params;
    const hostDetails = await service.host.loadHostDetails(userName);
    return res.status(OK).json(hostDetails);
  },
);
