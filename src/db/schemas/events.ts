// import { z } from "@hono/zod-openapi";
import { relations } from "drizzle-orm";
import { date, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { userEvents } from "./userEvents";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  date: date("date", { mode: "string" }).notNull(),
  street: varchar("street", { length: 255 }).notNull(),
  suburb: varchar("suburb", { length: 255 }).notNull(),
  postcode: varchar("postcode", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export const eventRelations = relations(events, ({ many }) => ({
  userEvents: many(userEvents),
}));

export const selectEventsSchema = createSelectSchema(events);

export const insertEventSchema = createInsertSchema(events, {
  date: schema => schema.min(1).max(50),
  street: schema => schema.min(1).max(50),
  suburb: schema => schema.min(1).max(50),
  postcode: schema => schema.length(4),
})
  .omit({ id: true, createdAt: true, updatedAt: true });
