import {
  activateTokenSchema,
  loginSchema,
  passwordResetSchema,
  putPictureSchema,
  renewTokenSchema,
  signUpSchema,
  updateAccountSchema,
} from '../schema/auth.schema';

export enum LOGIN_OS {
  WEB = 'web',
  IOS = 'iOS',
  ANDROID = 'android',
}

export type accountSchema = {
  userName: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  description: string;
  picture: string;
};

export type userSchema = accountSchema;

export type hostSchema = accountSchema & {
  isVerified: boolean;
};

type loginSchemaBody = typeof loginSchema.shape.body;
export type loginSchema = Zod.infer<loginSchemaBody>;

type signUpSchemaBody = typeof signUpSchema.shape.body;
export type signUpSchema = Zod.infer<signUpSchemaBody> & {
  isUserSignUp: boolean;
};

type renewTokenSchemaBody = typeof renewTokenSchema.shape.body;
export type renewTokenSchema = Zod.infer<renewTokenSchemaBody>;

type activateTokenSchemaBody = typeof activateTokenSchema.shape.body;
export type activateTokenType = Zod.infer<activateTokenSchemaBody>;

type passwordResetBody = typeof passwordResetSchema.shape.body;
export type passwordResetSchema = Zod.infer<passwordResetBody>;

type putPictureBody = typeof putPictureSchema.shape.body;
export type putPictureType = Zod.infer<putPictureBody>;

type putAccountBody = typeof updateAccountSchema.shape.body;
export type updateAccountType = Zod.infer<putAccountBody>;
