import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import service from '../../services';
import { eventSearch, eventType } from '../../types/event';
import assert from 'assert';
import { ApiError } from '../../utils/apiError';
import { CREATED, INTERNAL_SERVER_ERROR } from 'http-status';
import { User } from '@prisma/client';

export const postEvent = catchAsync(
  async (
    req: Request<object, object, eventType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const user = req.user;
    console.log(req.user);
    assert(
      user != null,
      new ApiError(INTERNAL_SERVER_ERROR, 'Ein Fehler ist aufgetreten'),
    );
    const event = await service.events.createEvent(
      req.body,
      (user as User).aId,
    );
    return res.status(CREATED).json({ event });
  },
);

export const getEvents = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const events = await service.events.getAllEvents();
    return res.status(200).json({ events });
  },
);

export const getEventsFilterCategory = catchAsync(
  async (
    req: Request<object, object, eventSearch>,
    res: Response,
    _next: NextFunction,
  ) => {
    const { category, endDate, location, startDate } = req.body;
    const filter = {
      ...(!!category && { category }),
      ...(!!endDate && { endDate }),
      ...(!!location && { location }),
      ...(!!startDate && { startDate }),
    };
    if (!filter)
      return res.status(200).json({ ...(await service.events.getAllEvents()) });
  },
);
