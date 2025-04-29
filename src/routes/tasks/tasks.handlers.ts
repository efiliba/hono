import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { tasks } from "@/db/schema";
import { HttpStatusCodes, HttpStatusPhrases } from "helpers";

import type { CreateRoute, GetOneRoute, ListRoute } from "./tasks.routes";

export const list: AppRouteHandler<ListRoute> = async context =>
  context.json(await db.query.tasks.findMany());

export const getOne: AppRouteHandler<GetOneRoute> = async (context) => {
  const { id } = context.req.valid("param");
  const task = await db.query.tasks.findFirst({
    where: (fields, operators) => operators.eq(fields.id, id),
  });

  if (!task) {
    return context.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  return context.json(task, HttpStatusCodes.OK);
};

export const create: AppRouteHandler<CreateRoute> = async (context) => {
  const task = context.req.valid("json");
  const [inserted] = await db.insert(tasks).values(task).returning();
  return context.json(inserted, HttpStatusCodes.OK);
};
