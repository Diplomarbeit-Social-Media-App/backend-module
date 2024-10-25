import httpStatus from "http-status";
import { ApiError } from "../../utils/api-error-util";
import db from "../../utils/db-util";
import { Account } from "@prisma/client";

export const findAccountByPk = async (aId: number) => {
  const found = db.account.findFirst({
    where: {
      aId,
    },
  });
  if (!found)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Account with account id not found!",
      true
    );
  return found;
};

export const isHostAccount = async (account: Partial<Account>): Promise<boolean> => {
  return !!(await db.host.findFirst({ where: { aId: account.aId } }));
};
