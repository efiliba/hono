import { z } from "@hono/zod-openapi";

import { HttpStatusPhrases } from "helpers";

export const ZOD_ERROR_MESSAGES = {
  REQUIRED: "Required",
  EXPECTED_NUMBER: "Expected number, received nan",
  NO_UPDATES: "No updates provided",
};

export const ZOD_ERROR_CODES = {
  INVALID_UPDATES: "invalid_updates",
};

export const notFoundSchema = z
  .object({ message: z.string() })
  .openapi({
    example: {
      message: HttpStatusPhrases.NOT_FOUND,
    },
  });
