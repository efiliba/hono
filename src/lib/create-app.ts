import { OpenAPIHono } from "@hono/zod-openapi";
import { csrf } from "hono/csrf";
import { jwt } from "hono/jwt";

import env from "@/env";
import { pinoLogger } from "@/middlewares/pino-logger";
import { defaultHook, notFound, onError, serveEmojiFavicon } from "helpers";

import type { AppBindings, AppOpenAPI } from "./types";

export const createRouter = () =>
  new OpenAPIHono<AppBindings>({ strict: false, defaultHook }); // ignore trailing /

export const createApp = () => {
  const app = createRouter();

  if (["production", "development"].includes(env.NODE_ENV)) {
    if (env.NODE_ENV === "production") {
      app.use("*", csrf());
    }

    // app.use("/tasks/*", jwt({ secret: env.JWT_SECRET, cookie: "authToken" }));
  }

  app.use(serveEmojiFavicon("😀"));
  app.use(pinoLogger());

  app.notFound(notFound);
  app.onError(onError);

  return app;
};

// Create a router for tests with the same middleware and error handlers, ...
export const createTestApp = (router: AppOpenAPI) => {
  const testApp = createApp();
  testApp.route("/", router);

  return testApp;
};
