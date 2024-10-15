import { ApiError } from "@utils/api-error-util";
import db from "../utils/db-util";
import httpStatus from "http-status";

export const findUser = async (userName: string, password: string) => {
  const hashed = ""; //TODO: hash password!
  const found = db.account.findFirst({
    where: {
      userName,
      password,
    },
  });
};

export const createUserByAccount = async (accountId: number) => {
  const account = await db.account.findFirst({
    where: {
      aId: accountId,
    },
  });
  if (!account)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "No account found with accountId in userService/createUserByAccount",
      true
    );
  const found = await db.user.findFirst({
    where: {
      aId: accountId,
    },
  });
  if (!!found)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "User already found with given accound-id",
      true
    );
  const user = db.user.create({
    data: {
      account: {
        connect: account,
      },
    },
  });

  return { user, account };
};
