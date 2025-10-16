import { z } from "@hono/zod-openapi";
import { boolean, date, integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  surname: varchar("surname", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 255 }).notNull().unique(),
  dob: date("dob", { mode: "string" }),
  sex: varchar("sex", { length: 255 }),
  height: integer("height"),
  weight: integer("weight"),
  elo: integer("elo").notNull().default(1000),
  verified: boolean("verified").notNull().default(false),
  emailVerified: boolean("email_verified").notNull().default(false),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  password: varchar("password", { length: 255 }).notNull(),
  confirmationCode: varchar("confirmation_code", { length: 255 }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export const selectUsersSchema = createSelectSchema(users)
  .omit({ password: true });

export const insertUserSchema = createInsertSchema(users, {
  firstName: schema => schema.min(1).max(50),
  surname: schema => schema.min(1).max(50),
  email: () => z.email(),
  password: schema => schema.min(1).max(50),
})
  .omit({ createdAt: true, updatedAt: true });

export const loginSchema = createSelectSchema(users)
  .omit({ firstName: true, surname: true, createdAt: true });
