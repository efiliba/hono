import type { CookieOptions } from "hono/utils/cookie";

import { sign } from "hono/jwt";

import env from "@/env";

export const generateToken = (sub: string) => {
  const now = Math.floor(Date.now() / 1000);
  return sign({ sub, iat: now, exp: now + 60 * 60 }, env.JWT_SECRET);
};

export const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production", // Only over https (disable for dev)
  sameSite: "strict",
  maxAge: 60 * 60,
  path: "/",
} as CookieOptions;
