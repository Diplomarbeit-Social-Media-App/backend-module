import bcrypt from "bcrypt";
import { accountSchema, signUpSchema } from "../types/auth-types";
import db from "../utils/db-util";
import { TOKEN_TYPES, tokenSchema } from "../types/token-types";
import jwt from "jsonwebtoken";
import dayjs, { ManipulateType } from "dayjs";
import config from "../config/config";
import pick from "lodash/pick";
import * as tokenService from "@services/token-services";

export const hashPassword = async (password: string, salt: number) => {
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashed: string) => {
  return await bcrypt.compare(password, hashed);
};

export const createAccount = async (account: signUpSchema) => {
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

  const payload: tokenSchema = {
    iat: dayjs().toDate(),
    exp: dayjs().add(expiresFormat.value, expiresFormat.unit).toDate(),
    sub: accountId,
    type,
  };
  return await new Promise((resolve, reject) =>
    jwt.sign(payload, config.JWT_SECRET, (err, jwt) => {
      if (jwt) return resolve(jwt);
      reject(err);
    })
  );
};

export const generateAndSaveTokens = async (accountId: number) => {
  const refresh = await generateToken(accountId, TOKEN_TYPES.REFRESH);
  const access = await generateToken(accountId, TOKEN_TYPES.ACCESS);

  await tokenService.deleteAccountTokens(accountId);
};
