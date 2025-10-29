import { createRouter } from "@/lib";

import * as handlers from "./events.handlers";
import * as routes from "./events.routes";

export const events = createRouter()
  .openapi(routes.get, handlers.get)
  .openapi(routes.create, handlers.create);
