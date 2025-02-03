import {
  deleteAboSchema,
  deleteRequestSchema,
  getForeignProfileSchema,
  postAboSchema,
  requestStateSchema,
  searchSchema,
} from '../schema/abo.schema';
import { AboRequest } from '@prisma/client';

export enum ABO_REQUEST_STATE {
  PENDING = 0,
  ACCEPTED = 1,
  DECLINED = 2,
  DELETED = 3,
}

export enum ABO_FILTER_SCHEMA {
  ALL = 0,
  OPEN = 1,
  CLOSED = 2,
}

export enum ABO_REQUEST_MODIFY {
  ACCEPT = 0,
  DECLINE = 1,
  DELETE = 2,
}

type postAboBody = typeof postAboSchema.shape.body;
export type postAboType = Zod.infer<postAboBody>;

type searchParams = typeof searchSchema.shape.params;
export type searchType = Zod.infer<searchParams>;

type requestStateBody = typeof requestStateSchema.shape.body;
export type requestStateType = Zod.infer<requestStateBody>;

export type extendedAboRequest = {
  fromUser: {
    uId: number;
    aId: number;
  };
  toUser: {
    uId: number;
    aId: number;
  };
} & AboRequest;

export type BasicAccountRepresentation = {
  uId: number | null;
  hId: number | null;
  account: {
    picture: string | null;
    userName: string;
    aId: number;
  };
  isUserAccount: boolean;
};

type deleteRequestParams = typeof deleteRequestSchema.shape.params;
export type deleteRequestType = Zod.infer<deleteRequestParams>;

type deleteAboParams = typeof deleteAboSchema.shape.params;
export type deleteAboType = Zod.infer<deleteAboParams>;

type getForeignProfileParams = typeof getForeignProfileSchema.shape.params;
export type getForeignProfileType = Zod.infer<getForeignProfileParams>;
