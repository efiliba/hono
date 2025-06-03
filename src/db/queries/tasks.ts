import { eq } from "drizzle-orm";

import db from "@/db";
import { tasks } from "@/db/schemas";

import type { InsertTask, UpdateTask } from "../types";

export const getTasks = () => db.query.tasks.findMany();

export const getTask = (id: number) =>
  db.query.tasks.findFirst({
    where: (fields, operators) => operators.eq(fields.id, id),
  });

export const createTask = async (task: InsertTask) => {
  const [created] = await db.insert(tasks).values(task).returning();
  return created;
};

export const updateTask = async (id: number, task: UpdateTask) => {
  const [updated] = await db.update(tasks).set(task).where(eq(tasks.id, id)).returning();
  return updated;
};

export const deleteTask = async (id: number) => {
  const { rowsAffected } = await db.delete(tasks).where(eq(tasks.id, id));
  return rowsAffected > 0;
};
