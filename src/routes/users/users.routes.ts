import { createRoute, z } from "@hono/zod-openapi";

import { insertUsersSchema, selectUsersSchema } from "@/db/schema";
import { notFoundSchema } from "@/lib";
import { createErrorSchema, HttpStatusCodes } from "helpers";

const tags = ["Users"];

export const get = createRoute({
  path: "/users",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: { // 200
      content: {
        "application/json": {
          schema: z.array(selectUsersSchema),
        },
      },
      description: "The list of users",
    },
  },
});

const emailParamsSchema = z.object({
  email: z.string().email().openapi({
    param: {
      name: "email",
      in: "path",
      required: true,
    },
    required: ["email"],
    example: "a@b.com",
  }),
});

export const getByEmail = createRoute({
  path: "/users/{email}",
  method: "get",
  tags,
  request: {
    params: emailParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: { // 200
      content: {
        "application/json": {
          schema: selectUsersSchema,
        },
      },
      description: "The requested user",
    },
    [HttpStatusCodes.NOT_FOUND]: { // 404
      content: {
        "application/json": {
          schema: notFoundSchema,
        },
      },
      description: "User not found",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: { // 422
      content: {
        "application/json": {
          schema: createErrorSchema(emailParamsSchema),
        },
      },
      description: "Invalid email",
    },
  },
});

export const create = createRoute({
  path: "/users",
  method: "post",
  tags,
  request: {
    body: {
      content: {
        "application/json": {
          schema: insertUsersSchema,
        },
      },
      description: "The user to create",
      required: true,
    },
  },
  responses: {
    [HttpStatusCodes.CREATED]: { // 201
      content: {
        "application/json": {
          schema: selectUsersSchema,
        },
      },
      description: "The created user",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: { // 422
      content: {
        "application/json": {
          schema: createErrorSchema(insertUsersSchema),
        },
      },
      description: "The validation error",
    },
  },
});

export type GetRoute = typeof get;
export type GetByEmailRoute = typeof getByEmail;
export type CreateRoute = typeof create;
