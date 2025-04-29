import { pinoLogger } from "@/middlewares/pino-logger";
import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound, onError, serveEmojiFavicon } from "helpers";
export function createRouter() {
    return new OpenAPIHono({ strict: false }); // ignore trailing /
}
export default function createApp() {
    const app = createRouter();
    app.use(serveEmojiFavicon("😀"));
    app.use(pinoLogger());
    app.notFound(notFound);
    app.onError(onError);
    return app;
}
