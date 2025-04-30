import { OpenAPIHono } from "@hono/zod-openapi";

import { pinoLogger } from "@/middlewares/pino-logger";
import { defaultHook, notFound, onError, serveEmojiFavicon } from "helpers";

import type { AppBindings, AppOpenAPI } from "./types";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({ strict: false, defaultHook }); // ignore trailing /
}

export default function createApp() {
  const app = createRouter();

  app.use(serveEmojiFavicon("😀"));
  app.use(pinoLogger());

  app.notFound(notFound);
  app.onError(onError);

  return app;
}

// Create a router for tests with the same middleware and error handlers, ...
export function createTestApp(router: AppOpenAPI) {
  const testApp = createApp();
  testApp.route("/", router);

  return testApp;
}
