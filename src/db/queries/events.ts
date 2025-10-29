import db from "@/db";
import { events } from "@/db/schemas";

import type { InsertEvent } from "../types";

export const getEvents = () => db.query.events.findMany();

export const createEvent = async (event: InsertEvent) => {
  const [created] = await db.insert(events).values(event).returning();
  return created;
};
