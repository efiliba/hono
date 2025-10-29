import type { AppRouteHandler } from "@/lib";

import { createEvent, getEvents } from "@/db/queries/events";
import { HttpStatusCodes } from "helpers";

import type { CreateRoute, GetRoute } from "./events.routes";

export const get: AppRouteHandler<GetRoute> = async context =>
  context.json(await getEvents());

export const create: AppRouteHandler<CreateRoute> = async (context) => {
  const event = context.req.valid("json");
  const created = await createEvent(event);
  return context.json(created, HttpStatusCodes.CREATED);
};
