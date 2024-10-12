import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import { ApiError } from "../utils/api-error-util";
import logger from "../logger/logger";
import httpStatus from "http-status";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = await schema.safeParseAsync({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    if (parsed.error && !res.headersSent) {
      const validationError = parsed.error.errors?.at(0)?.message;
      logger.debug(`Validation failed: ${validationError}`);
      return next(
        new ApiError(
          httpStatus.BAD_REQUEST,
          `Malformed request body! Please check arguments! (hint: ${validationError})`,
          true
        )
      );
    }
    Object.assign(req.body, parsed.data);
    return next();
  };
