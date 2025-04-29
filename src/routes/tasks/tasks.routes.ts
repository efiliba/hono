import { createRoute, z } from "@hono/zod-openapi";

import { insertTasksSchema, selectTasksSchema } from "@/db/schema";
import { HttpStatusCodes, createErrorSchema } from "helpers";

const tags = ["Tasks"];

export const list = createRoute({
  path: "/tasks",
  method: "get",
  tags,
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(selectTasksSchema),
        },
      },
      description: "The list of tasks",
    },
  },
});

export const create = createRoute({
  path: "/tasks",
  method: "post",
  request: {
    body: {
      content: {
        "application/json": {
          schema: insertTasksSchema,
        },
      },
      description: "The task to create",
      required: true,
    },
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: { // 200
      content: {
        "application/json": {
          schema: selectTasksSchema,
        },
      },
      description: "The created task",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: { // 422
      content: {
        "application/json": {
          schema: createErrorSchema(insertTasksSchema),
        },
      },
      description: "The validation error",
    },

  },
});

export type ListRoute = typeof list;

export type CreateRoute = typeof create;
