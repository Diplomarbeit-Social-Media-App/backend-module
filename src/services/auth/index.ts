import bcrypt from "bcrypt";
import { signUpSchema } from "../../types/auth-types";
import db from "@utils/db-util";
import { TOKEN_TYPES, tokenSchema } from "../../types/token-types";
import jwt from "jsonwebtoken";
import dayjs, { ManipulateType } from "dayjs";
import config from "@config/config";
import pick from "lodash/pick";
import service from "@services/index";
import { Account } from "@prisma/client";

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
  const date: Date =
    account.dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
  return db.account.create({
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
};

export const generateToken = async (accountId: number, type: TOKEN_TYPES) => {
  const expiresFormat: { unit: ManipulateType; value: number } =
    type === TOKEN_TYPES.ACCESS
      ? { unit: "minute", value: config.JWT_ACCESS_EXPIRATION_MINUTES }
      : { unit: "day", value: config.JWT_REFRESH_EXPIRATION_DAYS };
  const exp = dayjs(Date.now())
    .add(expiresFormat.value, expiresFormat.unit)
    .unix();
  const iat = dayjs(Date.now()).unix();
  const payload: tokenSchema = {
    iat: iat,
    exp: exp,
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
    exp: dayjs(exp).toDate(),
    iat: dayjs(iat).toDate(),
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
