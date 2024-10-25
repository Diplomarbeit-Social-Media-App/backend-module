import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catch-async-util";
import service from "../../services";

export const postEvent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    
  }
);

export const getEvents = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const events = await service.events.getAllEvents();
    return res.status(200).json({ events });
  }
);
