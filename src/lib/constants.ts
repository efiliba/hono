import { z } from "@hono/zod-openapi";

import { HttpStatusPhrases } from "helpers";

export const notFoundSchema = z.object({
  message: z.string(),
}).openapi({
  example: {
    message: HttpStatusPhrases.NOT_FOUND,
  },
});
