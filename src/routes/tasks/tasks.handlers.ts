import { eq } from "drizzle-orm";

import type { AppRouteHandler } from "@/lib";

import db from "@/db";
import { tasks } from "@/db/schema";
import { HttpStatusCodes, HttpStatusPhrases } from "helpers";

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from "./tasks.routes";

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
  return context.json(inserted, HttpStatusCodes.CREATED);
};

export const patch: AppRouteHandler<PatchRoute> = async (context) => {
  const { id } = context.req.valid("param");
  const updates = context.req.valid("json");

  const [task] = await db.update(tasks)
    .set(updates)
    .where(eq(tasks.id, id))
    .returning();

  if (!task) {
    return context.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }
  return context.json(task, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (context) => {
  const { id } = context.req.valid("param");
  const result = await db.delete(tasks)
    .where(eq(tasks.id, id));

  if (result.rowsAffected > 0) {
    return context.body(null, HttpStatusCodes.NO_CONTENT);
  }
  return context.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
};
