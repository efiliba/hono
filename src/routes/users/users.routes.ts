import { createRoute, z } from "@hono/zod-openapi";

import { insertUserSchema, loginSchema, selectUsersSchema } from "@/db/schemas";
import { notFoundSchema, ZOD_ERROR_MESSAGES } from "@/lib";
import { createErrorSchema, HttpStatusCodes, HttpStatusPhrases } from "helpers";

const tags = ["Users"];

export const login = createRoute({
  path: "/login",
  method: "post",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            email: z.string().email(),
            password: z.string().min(1),
          }),
        },
      },
      required: true,
    },
  },
  responses: {
    [HttpStatusCodes.OK]: { // 200
      content: {
        "application/json": {
          schema: selectUsersSchema,
        },
      },
      description: "Log in the user",
    },
    [HttpStatusCodes.UNAUTHORIZED]: { // 401
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: "Invalid credentials",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: { // 422
      content: {
        "application/json": {
          schema: createErrorSchema(loginSchema),
        },
      },
      description: "The validation error",
    },
  },
});

export const logout = createRoute({
  path: "/logout",
  method: "get",
  tags: ["Auth"],
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { // 204
      description: "Log out the user",
    },
  },
});

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
          schema: insertUserSchema,
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
    [HttpStatusCodes.CONFLICT]: { // 409
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: false }),
            error: z
              .object({
                issues: z.array(
                  z.object({
                    code: z.string(),
                    path: z.array(z.string()),
                    message: z.string(),
                  }),
                ),
                name: z.string(),
              })
              .openapi({
                example: {
                  issues: [{
                    code: HttpStatusPhrases.CONFLICT,
                    path: ["email"],
                    message: ZOD_ERROR_MESSAGES.DUPLICATE_EMAIL,
                  }],
                  name: "ZodError",
                },
              }),
          }),
        },
      },
      description: "Email already exists",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: { // 422
      content: {
        "application/json": {
          schema: createErrorSchema(insertUserSchema),
        },
      },
      description: "The validation error",
    },
  },
});

export type LoginRoute = typeof login;
export type LogoutRoute = typeof logout;
export type GetRoute = typeof get;
export type GetByEmailRoute = typeof getByEmail;
export type CreateRoute = typeof create;
