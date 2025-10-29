import { z } from "@hono/zod-openapi";

import { HttpStatusPhrases } from "helpers";

export const ZOD_ERROR_MESSAGES = {
  REQUIRED: "Invalid input: expected string, received undefined",
  EXPECTED_NUMBER: "Invalid input: expected number, received NaN",
  EXPECTED_NUMBER_BUT_UNDEFINED: "Invalid input: expected number, received undefined",
  INVALID_EMAIL: "Invalid email address",
  NO_UPDATES: "No fields provided to update",
  DUPLICATE_EMAIL: "Email already exists",
  DUPLICATE_PHONE: "Phone number already exists",
};

export type ZOD_ERROR_MESSAGE_TYPE = (typeof ZOD_ERROR_MESSAGES)[keyof typeof ZOD_ERROR_MESSAGES];

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
