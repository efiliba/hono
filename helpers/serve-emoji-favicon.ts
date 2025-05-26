import type { MiddlewareHandler } from "hono";

export function serveEmojiFavicon(emoji: string): MiddlewareHandler {
  return async (context, next) => {
    if (context.req.path === "/favicon.ico") {
      context.header("Content-Type", "image/svg+xml");
      return context.body(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <text x="-.1em" y=".9em" font-size="90">${emoji}</text>
      </svg>`);
    }
    return next();
  };
}
