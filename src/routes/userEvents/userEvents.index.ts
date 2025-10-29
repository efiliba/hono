import { createRouter } from "@/lib";

import * as handlers from "./userEvents.handlers";
import * as routes from "./userEvents.routes";

export const userEvents = createRouter()
  .openapi(routes.get, handlers.get)
  .openapi(routes.create, handlers.create);
