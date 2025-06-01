import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { PinoLogger } from "hono-pino";
import type { z } from "zod";

import type { insertTasksSchema, patchTasksSchema } from "@/db/schema";

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
  };
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

export type InsertTask = z.infer<typeof insertTasksSchema>;

export type UpdateTask = z.infer<typeof patchTasksSchema>;
