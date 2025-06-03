import { createRouter } from "@/lib";

import * as handlers from "./users.handlers";
import * as routes from "./users.routes";

export const users = createRouter()
  .openapi(routes.get, handlers.get)
  .openapi(routes.getByEmail, handlers.getByEmail)
  .openapi(routes.create, handlers.create)
  .openapi(routes.login, handlers.authenticate);
