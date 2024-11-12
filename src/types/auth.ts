import {
  loginSchema,
  passwordReset,
  renewTokenSchema,
  signUpSchema,
} from "../schema/auth";

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

const loginSchemaBody = loginSchema.shape.body;
export type loginSchema = Zod.infer<typeof loginSchemaBody>;

const signUpSchemaBody = signUpSchema.shape.body;
export type signUpSchema = Zod.infer<typeof signUpSchemaBody> & {
  isUserSignUp: boolean;
};

const renewTokenSchemaBody = renewTokenSchema.shape.body;
export type renewTokenSchema = Zod.infer<typeof renewTokenSchemaBody>;

const passwordResetBody = passwordReset.shape.body;
export type passwordResetSchema = Zod.infer<typeof passwordResetBody>;
