import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = sqliteTable("users", {
  email: text("email")
    .primaryKey(),
  firstName: text("first_name")
    .notNull(),
  surname: text("surname")
    .notNull(),
  password: text("password")
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
});

export const selectUsersSchema = createSelectSchema(users)
  .omit({ password: true });

export const insertUsersSchema = createInsertSchema(users, {
  email: schema => schema.email(),
  firstName: schema => schema.min(1).max(50),
  surname: schema => schema.min(1).max(50),
  password: schema => schema.min(1).max(50),
})
  .omit({ createdAt: true });

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

export const insertTasksSchema = createInsertSchema(tasks, {
  name: schema => schema.min(1).max(20),
})
  .required({ done: true })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export const patchTasksSchema = insertTasksSchema.partial();
