import { z } from "@hono/zod-openapi";

import { HttpStatusPhrases } from "helpers";

export const ZOD_ERROR_MESSAGES = {
  REQUIRED: "Invalid input: expected string, received undefined",
  EXPECTED_NUMBER: "Invalid input: expected number, received NaN",
  INVALID_EMAIL: "Invalid email address",
  NO_UPDATES: "No fields provided to update",
  DUPLICATE_EMAIL: "Email already exists",
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
