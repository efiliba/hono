import createApp from "@/lib/create-app";

const app = createApp();

app.get("/", (c) => {
  return c.text("Hello Open API Hono!");
});

app.get("/error", (c) => {
  c.var.logger.info("Test logger output in pino logs");
  c.var.logger.debug("Only visible when debug level enabled!");
  throw new Error("Test Error route");
});

export default app;
