import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import service from "../../services";
import { eventSearch, eventType } from "../../types/event";

export const postEvent = catchAsync(
  async (
    req: Request<{}, {}, eventType>,
    res: Response,
    next: NextFunction
  ) => {
    
  }
);

export const getEvents = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const events = await service.events.getAllEvents();
    return res.status(200).json({ events });
  }
);

export const getEventsFilterCategory = catchAsync(
  async (
    req: Request<{}, {}, eventSearch>,
    res: Response,
    next: NextFunction
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
  }
);
