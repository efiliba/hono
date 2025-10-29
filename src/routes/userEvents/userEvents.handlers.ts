import type { AppRouteHandler } from "@/lib";

import { createUserEvent, getUserEvents } from "@/db/queries/userEvents";
import { HttpStatusCodes } from "helpers";

import type { CreateRoute, GetRoute } from "./userEvents.routes";

export const get: AppRouteHandler<GetRoute> = async context =>
  context.json(await getUserEvents());

export const create: AppRouteHandler<CreateRoute> = async (context) => {
  const event = context.req.valid("json");
  const created = await createUserEvent(event);
  return context.json(created, HttpStatusCodes.CREATED);
};
