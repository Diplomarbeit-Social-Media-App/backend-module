export enum TOKEN_TYPES {
  ACCESS,
  REFRESH,
}

/**
 * @TheConsoleLog
 * sub should be used to store the pk of account field
 */
export type tokenSchema = {
  iat: Date;
  exp: Date;
  type: TOKEN_TYPES;
  sub: number; 
}