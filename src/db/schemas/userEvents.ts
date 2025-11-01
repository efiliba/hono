// import { z } from "@hono/zod-openapi";
import { relations } from "drizzle-orm";
import { date, integer, pgTable, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { events } from "./events";
import { users } from "./users";

export const userEvents = pgTable("user_events", {
  userId: integer("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").notNull().references(() => events.id),
  dateRegistered: date("date_registered", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
}, table => [
  primaryKey({ name: "id", columns: [table.userId, table.eventId] }),
]);

export const userEventRelations = relations(userEvents, ({ one }) => ({
  user: one(users, { fields: [userEvents.userId], references: [users.id] }),
  event: one(events, { fields: [userEvents.eventId], references: [events.id] }),
}));

export const selectUserEventsSchema = createSelectSchema(userEvents);

export const insertUserEventSchema = createInsertSchema(userEvents, {
})
  .omit({ createdAt: true, updatedAt: true });
