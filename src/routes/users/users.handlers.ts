import type { Context } from "hono";
import type { PostgresError } from "postgres";

import * as argon2 from "argon2";
import { DrizzleQueryError } from "drizzle-orm/errors";
import { deleteCookie, setCookie } from "hono/cookie";

import type { AppRouteHandler, ZOD_ERROR_MESSAGE_TYPE } from "@/lib";

import { createUser, getUser, getUsers } from "@/db/queries/users";
import { cookieOptions, generateToken, ZOD_ERROR_MESSAGES } from "@/lib";
import { HttpStatusCodes, HttpStatusPhrases } from "helpers";

import type { CreateRoute, GetByEmailRoute, GetRoute, LoginRoute, LogoutRoute } from "./users.routes";

const extractPassword = <T extends { password: string }>({ password, ...rest }: T) => rest;

export const get: AppRouteHandler<GetRoute> = async (context) => {
  // const { sub: email } = context.get("jwtPayload");
  // console.log("Logged in user - making request:", email);

  const users = await getUsers();
  return context.json(users.map(extractPassword));
};

export const getByEmail: AppRouteHandler<GetByEmailRoute> = async (context) => {
  const { email } = context.req.valid("param");
  const user = await getUser(email);

  if (!user) {
    return context.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  return context.json(extractPassword(user), HttpStatusCodes.OK);
};

const createConflictError = (context: Context, path: string, message: ZOD_ERROR_MESSAGE_TYPE) =>
  context.json({
    success: false,
    error: {
      issues: [
        {
          code: HttpStatusPhrases.CONFLICT,
          path: [path],
          message,
        },
      ],
      name: "ZodError",
    },
  }, HttpStatusCodes.CONFLICT);

export const create: AppRouteHandler<CreateRoute> = async (context) => {
  const user = context.req.valid("json");

  try {
    const created = await createUser({ ...user, password: await argon2.hash(user.password) });
    return context.json(extractPassword(created), HttpStatusCodes.CREATED);
  } catch (error) {
    // PostgresError: duplicate key value violates unique constraint
    if (error instanceof DrizzleQueryError) {
      const pgError = error.cause as PostgresError | undefined;
      if (pgError?.code === "23505") {
        switch (pgError?.constraint_name) {
          case "users_email_unique":
            return createConflictError(context, "email", ZOD_ERROR_MESSAGES.DUPLICATE_EMAIL);
          case "users_phone_unique":
            return createConflictError(context, "phone", ZOD_ERROR_MESSAGES.DUPLICATE_PHONE);
        }
      }
    }
    throw error;
  }
};

export const authenticate: AppRouteHandler<LoginRoute> = async (context) => {
  const { email, password } = context.req.valid("json");
  const user = await getUser(email);

  const authenticated = user && await argon2.verify(user.password, password);
  if (authenticated) {
    const token = await generateToken(email);
    setCookie(context, "authToken", token, cookieOptions);

    return context.json(extractPassword(user), HttpStatusCodes.OK);
  }
  return context.json({ message: HttpStatusPhrases.UNAUTHORIZED }, HttpStatusCodes.UNAUTHORIZED);
};

export const logout: AppRouteHandler<LogoutRoute> = async (context) => {
  deleteCookie(context, "authToken");
  return context.body(null, HttpStatusCodes.NO_CONTENT);
};
