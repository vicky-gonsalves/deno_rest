import configs from "../config/config.ts";
import { Context, isHttpError, Status } from "../deps.ts";
import type { Err } from "../types/types.interface.ts";
import log from "./logger.middleware.ts";

/**
 * Throws Error with provided params
 * @param options
 * @throws Error Throws Error
 */
export const throwError = (options: Err): Error => {
  throw options;
};

/**
 * Error Handler Middleware function
 * @param ctx
 * @param next
 * @returns Promise<void>
 */
export const errorHandler = async (
  ctx: Context,
  next: () => Promise<void>,
): Promise<void> => {
  try {
    await next();
  } catch (err) {
    let message = err.message;
    const name = err.name;
    const path = err.path;
    const type = err.type;
    const status = err.status || err.statusCode || Status.InternalServerError;

    const { env } = configs;
    if (!isHttpError(err)) {
      message = env === "dev" || env === "development"
        ? message
        : "Internal Server Error";
    }

    if (env === "dev" || env === "development") {
      log.debug(err);
    }

    ctx.response.status = status;
    ctx.response.body = { message, name, path, type, status };
  }
};
