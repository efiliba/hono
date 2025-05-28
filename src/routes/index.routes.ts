import { createRoute, z } from "@hono/zod-openapi";

import { createRouter } from "@/lib";

export const index = createRouter().openapi(
  createRoute({
    tags: ["Index"],
    method: "get",
    path: "/",
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
        description: "Tasks API Index",
      },
    },
  }),
  context => context.json({
    message: "Tasks API",
  }),
);
