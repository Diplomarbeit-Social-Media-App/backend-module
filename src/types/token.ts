export enum TOKEN_TYPES {
  ACCESS,
  REFRESH,
  ACTIVATION,
  NOTIFICATION,
}

/**
 * @TheConsoleLog
 * sub should be used to store the pk of account field
 */
export type tokenSchema = {
  iat: number;
  exp: number;
  type: TOKEN_TYPES;
  sub: number;
};
