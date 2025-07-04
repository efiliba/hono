import type { Hook } from "@hono/zod-openapi";

import { UNPROCESSABLE_ENTITY } from "./http-status-codes";

export const defaultHook: Hook<any, any, any, any> = (result, context) => {
  if (!result.success) {
    return context.json(
      {
        success: result.success,
        error: result.error,
      },
      UNPROCESSABLE_ENTITY,
    );
  }
};
