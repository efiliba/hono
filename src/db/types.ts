import type { z } from "zod";

import type { insertEventSchema, insertTaskSchema, insertUserEventSchema, insertUserSchema, patchTaskSchema, selectUserEventsSchema } from "./schemas";

export type SelectUserEvent = z.infer<typeof selectUserEventsSchema>;

export type InsertUserEvent = z.infer<typeof insertUserEventSchema>;

export type InsertUser = z.infer<typeof insertUserSchema>;

export type InsertEvent = z.infer<typeof insertEventSchema>;

export type InsertTask = z.infer<typeof insertTaskSchema>;

export type UpdateTask = z.infer<typeof patchTaskSchema>;
