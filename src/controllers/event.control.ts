import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import service from '../services';
import {
  attendanceType,
  eventSearch,
  eventType,
  participationType,
} from '../types/event';
import assert from 'assert';
import { ApiError } from '../utils/apiError';
import {
  BAD_REQUEST,
  CREATED,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
} from 'http-status';
import { Account, User } from '@prisma/client';

export const deleteEvent = catchAsync(
  async (req: Request<attendanceType>, res: Response, _next: NextFunction) => {
    const { aId } = req.user as Account;
    const { eId } = req.params;

    const host = await service.host.findHostByAId(aId);
    const event = await service.event.findEventByEId(eId);
    assert(host && host.hId === event.creatorId);

    await service.event.deleteEvent(eId);

    return res.status(OK).json({});
  },
);

export const getParticipatingEvents = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { aId } = req.user as Account;
    const user = await service.user.findUserByAId(aId);
    const participating = await service.event.findEventsPartUser(user.uId);
    return res.status(OK).json({ events: participating });
  },
);

export const getAttendanceState = catchAsync(
  async (req: Request<attendanceType>, res, _next) => {
    const { eId } = req.params;
    const { aId } = req.user as Account;
    const hasAttendance = await service.event.hasAttendance(aId, eId);
    return res.status(OK).json({ attendance: hasAttendance });
  },
);

export const postParticipateEvent = catchAsync(
  async (req: Request<object, object, participationType>, res, _next) => {
    const { eId, attendance } = req.body;
    const { aId } = req.user as Account;
    const updatedAttendance = await service.event.participateEvent(
      aId,
      eId,
      attendance,
    );
    return res.status(OK).json({ attendance: updatedAttendance });
  },
);

export const getSearchByQuery = catchAsync(
  async (req, res: Response, _next: NextFunction) => {
    const { query } = req.params;
    const events = await service.event.searchByName(query);
    return res.status(200).json({ events });
  },
);

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
    const event = await service.event.createEvent(req.body, (user as User).aId);
    return res.status(CREATED).json({ event });
  },
);

export const updateEvent = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user as User;
    const event = await service.event.updateEvent(req.body, user);
    return res.status(200).json({ event });
  },
);

export const getEvents = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const events = await service.event.getAllEvents();
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
      return res.status(200).json({ ...(await service.event.getAllEvents()) });
  },
);
export const getEventDetails = catchAsync(async (req, res, _next) => {
  const eventId = req.params.eventId;
  assert(
    eventId != null,
    new ApiError(BAD_REQUEST, 'Es muss eine eventId mitgegeben werden'),
  );
  const event = await service.event.getEventDetails(Number(eventId));
  assert(event != null, new ApiError(NOT_FOUND, 'Event wurde nicht gefunden'));
  return res.status(200).json({ event });
});
