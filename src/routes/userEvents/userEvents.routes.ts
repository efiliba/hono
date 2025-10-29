import { createRoute, z } from "@hono/zod-openapi";

import { insertUserEventSchema, selectUserEventsSchema } from "@/db/schemas";
// import { notFoundSchema } from "@/lib";
import { createErrorSchema, HttpStatusCodes } from "helpers";

const tags = ["Events"];

export const get = createRoute({
  path: "/user-events",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: { // 200
      content: {
        "application/json": {
          schema: z.array(selectUserEventsSchema),
        },
      },
      description: "The list of user events",
    },
  },
});

// const idParamsSchema = z.object({
//   id: z.coerce.number().openapi({
//     param: {
//       name: "id",
//       in: "path",
//       required: true,
//     },
//     required: ["id"],
//     example: 42,
//   }),
// });

// export const getById = createRoute({
//   path: "/tasks/{id}",
//   method: "get",
//   tags,
//   request: {
//     params: idParamsSchema,
//   },
//   responses: {
//     [HttpStatusCodes.OK]: { // 200
//       content: {
//         "application/json": {
//           schema: selectTasksSchema,
//         },
//       },
//       description: "The requested task",
//     },
//     [HttpStatusCodes.NOT_FOUND]: { // 404
//       content: {
//         "application/json": {
//           schema: notFoundSchema,
//         },
//       },
//       description: "Task not found",
//     },
//     [HttpStatusCodes.UNPROCESSABLE_ENTITY]: { // 422
//       content: {
//         "application/json": {
//           schema: createErrorSchema(idParamsSchema),
//         },
//       },
//       description: "Invalid id",
//     },
//   },
// });

export const create = createRoute({
  path: "/user-events",
  method: "post",
  tags,
  request: {
    body: {
      content: {
        "application/json": {
          schema: insertUserEventSchema,
        },
      },
      description: "The user event to create",
      required: true,
    },
  },
  responses: {
    [HttpStatusCodes.CREATED]: { // 201
      content: {
        "application/json": {
          schema: selectUserEventsSchema,
        },
      },
      description: "The created user event",
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: { // 422
      content: {
        "application/json": {
          schema: createErrorSchema(insertUserEventSchema),
        },
      },
      description: "The validation error",
    },
  },
});

// export const patch = createRoute({
//   path: "/tasks/{id}",
//   method: "patch",
//   tags,
//   request: {
//     params: idParamsSchema,
//     body: {
//       content: {
//         "application/json": {
//           schema: patchTaskSchema,
//         },
//       },
//       description: "The task to update",
//       required: true,
//     },
//   },
//   responses: {
//     [HttpStatusCodes.OK]: { // 200
//       content: {
//         "application/json": {
//           schema: selectTasksSchema,
//         },
//       },
//       description: "The updated task",
//     },
//     [HttpStatusCodes.NOT_FOUND]: { // 404
//       content: {
//         "application/json": {
//           schema: notFoundSchema,
//         },
//       },
//       description: "Task not found",
//     },
//     [HttpStatusCodes.UNPROCESSABLE_ENTITY]: { // 422
//       content: {
//         "application/json": {
//           schema: createErrorSchema(patchTaskSchema)
//             .or(createErrorSchema(idParamsSchema)),
//         },
//       },
//       description: "The validation error",
//     },
//   },
// });

// export const remove = createRoute({
//   path: "/tasks/{id}",
//   method: "delete",
//   tags,
//   request: {
//     params: idParamsSchema,
//   },
//   responses: {
//     [HttpStatusCodes.NO_CONTENT]: { // 204
//       description: "Task deleted",
//     },
//     [HttpStatusCodes.NOT_FOUND]: { // 404
//       content: {
//         "application/json": {
//           schema: notFoundSchema,
//         },
//       },
//       description: "Task not found",
//     },
//     [HttpStatusCodes.UNPROCESSABLE_ENTITY]: { // 422
//       content: {
//         "application/json": {
//           schema: createErrorSchema(idParamsSchema),
//         },
//       },
//       description: "Invalid id",
//     },
//   },
// });

export type GetRoute = typeof get;
// export type GetByIdRoute = typeof getById;
export type CreateRoute = typeof create;
// export type PatchRoute = typeof patch;
// export type RemoveRoute = typeof remove;
