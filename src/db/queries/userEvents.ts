import db from "@/db";
import { userEvents } from "@/db/schemas";

import type { InsertUserEvent } from "../types";

export const getUserEvents = () => db.query.userEvents.findMany();

export const createUserEvent = async (userEvent: InsertUserEvent) => {
  const [created] = await db.insert(userEvents).values(userEvent).returning();
  return created;
};
