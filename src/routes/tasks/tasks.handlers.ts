import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { tasks } from "@/db/schema";

import type { CreateRoute, ListRoute } from "./tasks.routes";
import { HttpStatusCodes } from "helpers";

export const list: AppRouteHandler<ListRoute> = async context =>
  context.json(await db.query.tasks.findMany());

export const create: AppRouteHandler<CreateRoute> = async (context) => {
  const task = context.req.valid("json");
  const [inserted] = await db.insert(tasks).values(task).returning();
  return context.json(inserted, HttpStatusCodes.OK)
};
