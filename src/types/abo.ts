import {
  deleteAboSchema,
  deleteRequestSchema,
  getForeignProfileSchema,
  postAboSchema,
  requestStateSchema,
  searchSchema,
} from '../schema/abo.schema';
import { AboRequest } from '@prisma/client';
import * as Zod from 'zod';

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
