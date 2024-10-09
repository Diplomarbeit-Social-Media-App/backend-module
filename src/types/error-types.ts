export type baseResponse = {
  error: boolean;
  message: string;
  name: string;
  statusCode: number;
};

export type devEnvResponse = {
  stack: string;
};

type errorResFormat = baseResponse & Partial<devEnvResponse>;

export default errorResFormat;
