import { createRoute, z } from "@hono/zod-openapi";

const tags = ["Tasks"];

export const list = createRoute({
  path: "/tasks",
  method: "get",
  tags,
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(z.object({
            name: z.string(),
            done: z.boolean(),
          })),
        },
      },
      description: "The list of tasks",
    },
  },
});

export type ListRoute = typeof list;
