import type { AppRouteHandler } from "@/lib/types";

import type { ListRoute } from "./tasks.routes";

export const list: AppRouteHandler<ListRoute> = c => c.json([{
  name: "First Task",
  done: false,
}]);
