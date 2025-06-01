import { createRouter } from "@/lib";

import * as handlers from "./tasks.handlers";
import * as routes from "./tasks.routes";

export const tasks = createRouter()
  .openapi(routes.get, handlers.get)
  .openapi(routes.getById, handlers.getById)
  .openapi(routes.create, handlers.create)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove);
