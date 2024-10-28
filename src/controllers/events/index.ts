import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catch-async-util";
import service from "../../services";
import { eventType } from "../../types/event-types";

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
