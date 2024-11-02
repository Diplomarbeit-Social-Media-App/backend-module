import bcrypt from "bcrypt";
import { signUpSchema } from "../../types/auth";
import db from "../../utils/db";
import { TOKEN_TYPES, tokenSchema } from "../../types/token";
import jwt from "jsonwebtoken";
import dayjs, { ManipulateType } from "dayjs";
import config from "../../config/config";
import pick from "lodash/pick";
import service from "../index";
import { Account } from "@prisma/client";
import { ApiError } from "../../utils/apiError";
import { UNAUTHORIZED } from "http-status";
import assert from "assert";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const handleRenewToken = async (
  refresh: string
): Promise<{ access: string }> => {
  try {
    const tokenFound = await db.token.findFirst({
      where: {
        token: refresh,
        type: TOKEN_TYPES.REFRESH.toString(),
      },
    });
    assert.ok(tokenFound != null);

    const exp = dayjs(tokenFound.exp);
    const expired: boolean = exp.isBefore(dayjs());
    assert.ok(!expired);

    const accountFound = await db.account.findFirst({
      where: {
        aId: tokenFound.aId,
      },
    });
    assert.ok(accountFound != null);

    await db.token.deleteMany({
      where: {
        aId: tokenFound.aId,
        type: TOKEN_TYPES.ACCESS.toString(),
      },
    });

    return {
      access: await generateToken(accountFound.aId, TOKEN_TYPES.ACCESS),
    };
  } catch (err) {
    throw new ApiError(UNAUTHORIZED, "Anmeldung abgelaufen");
  }
};

export const hashPassword = async (password: string, salt: number) => {
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashed: string) => {
  return await bcrypt.compare(password, hashed);
};

export const createAccount = async (
  account: signUpSchema
): Promise<Account> => {
  const { dateOfBirth, email, firstName, lastName, userName, password } = pick(
    account,
    ["dateOfBirth", "email", "firstName", "lastName", "userName", "password"]
  );

  const date: Date = dayjs(dateOfBirth).toDate();
  try {
    return await db.account.create({
      data: {
        dateOfBirth: date,
        description: "",
        email,
        firstName,
        lastName,
        userName,
        password,
      },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const fields = error.meta?.target as string[] | undefined;
        const formatted =
          fields && fields?.length > 0
            ? fields?.map((str, index) =>
                index === 0
                  ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
                  : str.toLowerCase()
              )
            : fields;
        throw new ApiError(400, `Bitte verwende andere Werte für ${formatted}`);
      }
    }
    throw new ApiError(500, "Leider ist etwas schief gelaufen!");
  }
};

export const generateToken = async (accountId: number, type: TOKEN_TYPES) => {
  const expiresFormat: { unit: ManipulateType; value: number } =
    type === TOKEN_TYPES.ACCESS
      ? { unit: "minute", value: config.JWT_ACCESS_EXPIRATION_MINUTES }
      : { unit: "day", value: config.JWT_REFRESH_EXPIRATION_DAYS };

  const currDate = dayjs();
  const exp = currDate.add(expiresFormat.value, expiresFormat.unit);
  const iat = currDate;

  const payload: tokenSchema = {
    iat: iat.unix(),
    exp: exp.unix(),
    sub: accountId,
    type,
  };
  const token: string = await new Promise((resolve, reject) =>
    jwt.sign(
      {
        ...payload,
      },
      config.JWT_SECRET,
      {},
      (err, jwt) => {
        if (err || !jwt) return reject(err);
        resolve(jwt);
      }
    )
  );
  await service.token.saveAccountToken({
    aId: accountId,
    backlisted: false,
    exp: exp.toDate(),
    iat: iat.toDate(),
    token,
    type: type.toString(),
  });
  return token;
};

export const generateAndSaveTokens = async (
  accountId: number
): Promise<{ refresh: string; access: string }> => {
  await service.token.deleteAccountTokens(accountId);

  const refresh = await generateToken(accountId, TOKEN_TYPES.REFRESH);
  const access = await generateToken(accountId, TOKEN_TYPES.ACCESS);

  return { refresh, access };
};
