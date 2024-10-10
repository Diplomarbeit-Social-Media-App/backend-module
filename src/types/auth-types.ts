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

export type loginSchema = {
  userName: string;
  password: string;
};
