import type { AppRouteHandler } from "@/lib";
import { LibsqlError } from "@libsql/client";
import bcrypt from "bcrypt";
import type { Context } from "hono";

import { createUser, getUser, getUsers } from "@/db/queries/users";
import { ZOD_ERROR_MESSAGES } from "@/lib";
import { HttpStatusCodes, HttpStatusPhrases } from "helpers";

import type { CreateRoute, GetByEmailRoute, GetRoute } from "./users.routes";

export const get: AppRouteHandler<GetRoute> = async context => {
  const users = await getUsers();
  return context.json(users.map(({ password, ...user }) => user));
};

export const getByEmail: AppRouteHandler<GetByEmailRoute> = async (context) => {
  const { email } = context.req.valid("param");
  const user = await getUser(email);

  if (!user) {
    return context.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }
  
  const { password, ...userWithoutPassword } = user;
  return context.json(userWithoutPassword, HttpStatusCodes.OK);
};

const createEmailConflictError = (context: Context) =>   
  context.json({
    success: false,
    error: {
      issues: [
        {
          code: HttpStatusPhrases.CONFLICT,
          path: ["email"],
          message: ZOD_ERROR_MESSAGES.DUPLICATE_EMAIL,
        },
      ],
      name: "ZodError",
    },
  }, HttpStatusCodes.CONFLICT);

export const create: AppRouteHandler<CreateRoute> = async (context) => {
  const user = context.req.valid("json");
  
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const userWithHashedPassword = {
    ...user,
    password: hashedPassword,
  };

  try {
    const { password, ...newUser } = await createUser(userWithHashedPassword);
    return context.json(newUser, HttpStatusCodes.CREATED);
  }
  catch (error: unknown) {
    if (error instanceof LibsqlError && error.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
      return createEmailConflictError(context);
    }
    throw error;
  }
};
