import { Request } from 'express';
import { ABO_FILTER_SCHEMA, postAboType } from '../../types/abo';
import catchAsync from '../../utils/catchAsync';
import service from '../../services';
import { Account } from '@prisma/client';
import { CREATED } from 'http-status';

export const getAboRequests = catchAsync(async (req: Request, res, _next) => {
  const { filter } = req.params;
  const { aId } = req.user as Account;
  const aboRequests = await service.abo.loadAboRequests(
    filter as unknown as ABO_FILTER_SCHEMA,
    aId,
  );
  return res.status(200).json({ requests: aboRequests });
});

/**
 * Should check if userName is
 * - assigned
 * - not the same user as the requests comes from
 * - req. user has user account
 * - not already friended with user
 * - does not have a open/closed/declined request to this user
 */
export const postAboRequests = catchAsync(
  async (req: Request<object, object, postAboType>, res, _next) => {
    const { userName } = req.body;
    const { aId } = req.user as Account;

    const user = await service.user.findUserByAId(aId);
    await service.abo.sendAboRequest(user, userName);
    return res.status(CREATED).json({});
  },
);
