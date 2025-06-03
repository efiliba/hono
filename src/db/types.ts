import type { z } from "zod";

import type { insertTaskSchema, insertUserSchema, patchTaskSchema } from "./schemas";

export type InsertUser = z.infer<typeof insertUserSchema>;

export type InsertTask = z.infer<typeof insertTaskSchema>;

export type UpdateTask = z.infer<typeof patchTaskSchema>;
