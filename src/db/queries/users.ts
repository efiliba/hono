import db from "@/db";
import { users } from "@/db/schema";

import type { InsertUser } from "../types";

export const getUsers = () => db.query.users.findMany();

export const getUser = (email: string) =>
  db.query.users.findFirst({
    where: (fields, operators) => operators.eq(fields.email, email),
  });

export const createUser = async (user: InsertUser) => {
  try {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }
  catch {
    return false;
  }
};
