import {
  loginSchema,
  passwordResetSchema,
  renewTokenSchema,
  signUpSchema,
} from '../schema/auth';

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

type passwordResetBody = typeof passwordResetSchema.shape.body;
export type passwordResetSchema = Zod.infer<passwordResetBody>;
