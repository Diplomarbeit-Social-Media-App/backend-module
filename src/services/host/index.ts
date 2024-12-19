import { CONFLICT, NOT_FOUND } from 'http-status';
import { ApiError } from '../../utils/apiError';
import db from '../../utils/db';
import assert from 'assert';

export const createHostByAccount = async (aId: number, companyName: string) => {
  const account = await db.account.findUnique({
    where: {
      aId,
    },
    include: {
      host: true,
      user: true,
    },
  });
  assert(
    account != null,
    new ApiError(NOT_FOUND, 'Account mit Account-ID nicht gefunden'),
  );
  assert(
    !account.user,
    new ApiError(CONFLICT, 'Ein User-Account kann kein Host-Profil erstellen'),
  );
  assert(
    account.host == null,
    new ApiError(CONFLICT, 'Es gibt bereits ein Host-Profil'),
  );
  const host = await db.host.create({
    data: {
      companyName,
      account: {
        connect: account,
      },
    },
  });
  return host;
};
