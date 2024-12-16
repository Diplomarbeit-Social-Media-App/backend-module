import { getAboSchema } from '../schema/abo';

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

export const getFilterValues = (option: ABO_FILTER_SCHEMA): number[] => {
  if (option < 0 || option > 2) {
    throw new Error('Option out of range');
  }
  return ABO_FILTER_VALUES[ABO_FILTER_SCHEMA.ALL];
};

type getAboBody = typeof getAboSchema.shape.body;
export type getAboType = Zod.infer<getAboBody>;
