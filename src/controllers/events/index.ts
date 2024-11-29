import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import service from '../../services';
import { eventSearch, eventType } from '../../types/event';
import assert from 'assert';
import { ApiError } from '../../utils/apiError';
import {
  BAD_REQUEST,
  CREATED,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from 'http-status';
import { User } from '@prisma/client';

export const postEvent = catchAsync(
  async (
    req: Request<object, object, eventType>,
    res: Response,
    _next: NextFunction,
  ) => {
    const user = req.user;
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

export const updateEvent = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user as User;
    const event = await service.events.updateEvent(req.body, user);
    return res.status(200).json({ event });
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
export const getEventDetails = catchAsync(async (req, res, _next) => {
  const eventId = req.params.eventId;
  assert(
    eventId != null,
    new ApiError(BAD_REQUEST, 'Es muss eine eventId mitgegeben werden'),
  );
  const event = await service.events.getEventDetails(Number(eventId));
  assert(event != null, new ApiError(NOT_FOUND, 'Event wurde nicht gefunden'));
  return res.status(200).json({ event });
});
