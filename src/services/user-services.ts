import { User } from "@prisma/client";
import { userSchema } from "../types/auth-types";
import db from "../utils/db-util";

export const findUser = async (userName: string, password: string) => {
  const hashed = "" //TODO: hash password!
  const found = db.account.findFirst({ 
    where: {
      userName,
      password
    }
  })
}