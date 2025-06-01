import type { z } from "zod";

import type { insertTasksSchema, insertUsersSchema, patchTasksSchema, selectUsersSchema } from "./schema";

export type User = z.infer<typeof selectUsersSchema>;

export type InsertUser = z.infer<typeof insertUsersSchema>;

export type InsertTask = z.infer<typeof insertTasksSchema>;

export type UpdateTask = z.infer<typeof patchTasksSchema>;
