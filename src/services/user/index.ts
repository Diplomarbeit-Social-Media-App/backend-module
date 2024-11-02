import { ApiError } from "../../utils/apiError";
import db from "../../utils/db";
import httpStatus, { NOT_FOUND, UNAUTHORIZED } from "http-status";
import service from "../../services/index";
import { Account } from "@prisma/client";

export const findUser = async (
  userName: string,
  password: string
): Promise<Account> => {
  const found = await db.account.findFirst({
    where: {
      userName,
    },
  });
  if (!found)
    throw new ApiError(NOT_FOUND, "Username or password not found!", true);
  if (!service.auth.comparePassword(password, found.password))
    throw new ApiError(NOT_FOUND, "Username or password not found", true);
  if (found.disabled)
    throw new ApiError(UNAUTHORIZED, "Your account has been disabled", true);
  return found;
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
