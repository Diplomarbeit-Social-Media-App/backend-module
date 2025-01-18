import { TypeOf } from 'zod';
import {
  getAboSchema,
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

const ABO_FILTER_VALUES = Object.freeze({
  0: [
    ABO_REQUEST_STATE.PENDING,
    ABO_REQUEST_STATE.ACCEPTED,
    ABO_REQUEST_STATE.DECLINED,
    ABO_REQUEST_STATE.DELETED,
  ],
  1: [ABO_REQUEST_STATE.PENDING],
  2: [
    ABO_REQUEST_STATE.DECLINED,
    ABO_REQUEST_STATE.DELETED,
    ABO_REQUEST_STATE.ACCEPTED,
  ],
});

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

export const getFilterValues = (option: ABO_FILTER_SCHEMA): number[] => {
  if (option < 0 || option > 2) {
    throw new Error('Option out of range');
  }
  return ABO_FILTER_VALUES[option];
};

export type getAboParam = TypeOf<typeof getAboSchema>;

type getAboBody = typeof getAboSchema.shape.params;
export type getAboType = Zod.infer<getAboBody>;

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
