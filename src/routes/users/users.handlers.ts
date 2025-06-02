import type { AppRouteHandler } from "@/lib";

import { createUser, getUser, getUsers } from "@/db/queries/users";
import { ZOD_ERROR_MESSAGES } from "@/lib";
import { HttpStatusCodes, HttpStatusPhrases } from "helpers";

import type { CreateRoute, GetByEmailRoute, GetRoute } from "./users.routes";

export const get: AppRouteHandler<GetRoute> = async context =>
  context.json(await getUsers());

export const getByEmail: AppRouteHandler<GetByEmailRoute> = async (context) => {
  const { email } = context.req.valid("param");
  const task = await getUser(email);

  if (!task) {
    return context.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }
  return context.json(task, HttpStatusCodes.OK);
};

export const create: AppRouteHandler<CreateRoute> = async (context) => {
  const user = context.req.valid("json");
  const created = await createUser(user);

  if (!created) {
    return context.json({
      success: false,
      error: {
        issues: [
          {
            code: HttpStatusPhrases.CONFLICT,
            path: ["email"],
            message: ZOD_ERROR_MESSAGES.DUPLICATE_EMAIL,
          },
        ],
        name: "ZodError",
      },
    }, HttpStatusCodes.CONFLICT);
  }
  return context.json(created, HttpStatusCodes.CREATED);
};
