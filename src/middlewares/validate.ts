import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validate =
  async (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = await schema.safeParseAsync({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    if (parsed.error && !res.headersSent) {
      return res
        .status(400)
        .json({ message: `error occurred: ${parsed.error.message}` });
    }
    Object.assign(req, parsed.data);
    return next();
  };
