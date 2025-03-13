import assert from 'node:assert';
import db from '../utils/db';
import { ApiError } from '../utils/apiError';
import { NOT_FOUND } from 'http-status';

export const findLastMessageByGId = async (gId: number) => {
  return db.message.findFirst({
    where: { gId },
    orderBy: { timeStamp: 'desc' },
    select: {
      text: true,
      timeStamp: true,
      user: { select: { account: { select: { userName: true } } } },
    },
  });
};

export const findUnreadMessageCountByGId = async (gId: number, uId: number) => {
  const member = await db.groupMember.findFirst({
    where: { gId, uId },
  });
  assert(member, new ApiError(NOT_FOUND, 'Group member not found'));
  const unreadTimeStamp = member.lastReadAt;
  const count = await db.message.count({
    where: { gId, timeStamp: { gt: unreadTimeStamp } },
  });
  return count;
};
