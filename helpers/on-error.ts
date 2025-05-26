import type { ErrorHandler } from "hono";
import type { StatusCode } from "hono/utils/http-status";

import { INTERNAL_SERVER_ERROR, OK } from "./http-status-codes";

export const onError: ErrorHandler = (error, context) => {
  const currentStatus = ("status" in error ? error.status : context.newResponse(null).status) as StatusCode;

  const statusCode = currentStatus !== OK ? currentStatus : INTERNAL_SERVER_ERROR;

  // eslint-disable-next-line node/no-process-env
  const env = context.env?.NODE_ENV || process.env?.NODE_ENV;

  return context.json(
    {
      message: error.message,
      stack: env === "production" ? undefined : error.stack,
    },
    statusCode as any,
  );
};
