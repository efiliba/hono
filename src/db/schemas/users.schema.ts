import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  email: text("email").primaryKey(),
  firstName: text("first_name").notNull(),
  surname: text("surname").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const selectUsersSchema = createSelectSchema(users)
  .omit({ password: true });

export const insertUserSchema = createInsertSchema(users, {
  email: schema => schema.email(),
  firstName: schema => schema.min(1).max(50),
  surname: schema => schema.min(1).max(50),
  password: schema => schema.min(1).max(50),
})
  .omit({ createdAt: true });

export const loginSchema = createSelectSchema(users)
  .omit({ firstName: true, surname: true, createdAt: true });
