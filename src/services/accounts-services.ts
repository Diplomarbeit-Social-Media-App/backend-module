import httpStatus from "http-status";
import { ApiError } from "../utils/api-error-util";
import db from "../utils/db-util";

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
