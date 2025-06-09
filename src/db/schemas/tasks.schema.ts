import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { ZOD_ERROR_MESSAGES } from "@/lib";

export const tasks = sqliteTable("tasks", {
  id: integer("id", { mode: "number" })
    .primaryKey({ autoIncrement: true }),
  name: text("name")
    .notNull(),
  done: integer("done", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const selectTasksSchema = createSelectSchema(tasks);

export const insertTaskSchema = createInsertSchema(tasks, {
  name: schema => schema.min(1).max(20),
})
  .required({ done: true })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export const patchTaskSchema = z.object({
  ...insertTaskSchema.partial().shape,
}).superRefine((input, contex) => {
  if (Object.keys(input).length === 0) {
    contex.addIssue({
      code: z.ZodIssueCode.invalid_type,
      expected: "object",
      received: "undefined",
      path: ["name", "done"],
      message: ZOD_ERROR_MESSAGES.NO_UPDATES,
    });
  }
});
