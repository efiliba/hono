import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import index from "@/routes/index.routes";
import tasks from "@/routes/tasks/tasks.index";

const app = createApp();

// const _app = app
//   .route("/", index)
//   .route("/", tasks);

// export type AppType = typeof _app;

const routes = [
  index,
  tasks,
] as const;

routes.forEach(route => app.route("/", route));

configureOpenAPI(app);

// app.get("/", (c) => {
//   return c.text("Hello Open API Hono!");
// });

// app.get("/error", (c) => {
//   c.var.logger.info("Test logger output in pino logs");
//   c.var.logger.debug("Only visible when debug level enabled!");
//   throw new Error("Test Error route");
// });

export type AppType = typeof routes[number];

export default app;
