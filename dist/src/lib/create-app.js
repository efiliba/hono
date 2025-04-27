import { pinoLogger } from "@/middlewares/pino-logger";
import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound, onError, serveEmojiFavicon } from "helpers/middlewares";
export default function createApp() {
    const app = new OpenAPIHono({ strict: false }); // ignore trailing /
    app.use(serveEmojiFavicon("😀"));
    app.use(pinoLogger());
    app.notFound(notFound);
    app.onError(onError);
    return app;
}
