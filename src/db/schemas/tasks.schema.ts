import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { ZOD_ERROR_MESSAGES } from "@/lib";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  done: boolean("done").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
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
