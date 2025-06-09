import type { Context } from "hono";

import { LibsqlError } from "@libsql/client";
import * as argon2 from "argon2";
import { deleteCookie, setCookie } from "hono/cookie";

import type { AppRouteHandler } from "@/lib";

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

  try {
    const created = await createUser({ ...user, password: await argon2.hash(user.password) });
    return context.json(extractPassword(created), HttpStatusCodes.CREATED);
  }
  catch (error: unknown) {
    if (error instanceof LibsqlError && error.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
      return createEmailConflictError(context);
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
