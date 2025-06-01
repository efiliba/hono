import type { AppRouteHandler } from "@/lib";

import { createTask, deleteTask, getTask, getTasks, updateTask } from "@/db/queries/tasks";
import { HttpStatusCodes, HttpStatusPhrases } from "helpers";

import type { CreateRoute, GetByIdRoute, GetRoute, PatchRoute, RemoveRoute } from "./tasks.routes";

export const get: AppRouteHandler<GetRoute> = async context =>
  context.json(await getTasks());

export const getById: AppRouteHandler<GetByIdRoute> = async (context) => {
  const { id } = context.req.valid("param");
  const task = await getTask(id);

  if (!task) {
    return context.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }
  return context.json(task, HttpStatusCodes.OK);
};

export const create: AppRouteHandler<CreateRoute> = async (context) => {
  const task = context.req.valid("json");
  const created = await createTask(task);
  return context.json(created, HttpStatusCodes.CREATED);
};

export const patch: AppRouteHandler<PatchRoute> = async (context) => {
  const { id } = context.req.valid("param");
  const update = context.req.valid("json");

  const task = await updateTask(id, update);

  if (!task) {
    return context.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }
  return context.json(task, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (context) => {
  const { id } = context.req.valid("param");
  const rowDeleted = await deleteTask(id);

  if (rowDeleted) {
    return context.body(null, HttpStatusCodes.NO_CONTENT);
  }
  return context.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
};
