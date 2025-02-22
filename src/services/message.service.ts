import db from '../utils/db';

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
