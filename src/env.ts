/* eslint-disable node/no-process-env */
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "node:path";
import { z } from "zod";

expand(config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : process.env.NODE_ENV === "test"
        ? ".env.test"
        : ".env",
  ),
}));

const EnvSchema = z
  .object({
    NODE_ENV: z.string().default("development"),
    PORT: z.coerce.number().default(9999),
    LOG_LEVEL: z.enum(["fatal", "error", "warning", "info", "debug", "trace", "silent"]),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string(),
  //   DATABASE_AUTH_TOKEN: z.string().optional(),
  // })
  // .superRefine((input, contex) => {
  //   if (input.NODE_ENV === "production" && !input.DATABASE_AUTH_TOKEN) {
  //     contex.addIssue({
  //       code: z.ZodIssueCode.invalid_type,
  //       expected: "string",
  //       received: "undefined",
  //       path: ["DATABASE_AUTH_TOKEN"],
  //       message: "Must be set when NODE_ENV is 'production'",
  //     });
  //   }
  });

export type env = z.infer<typeof EnvSchema>;

const { data, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error("❌ Invalid env:");
  // Zod v4: use treeifyError instead of flatten/format
  // console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  console.error(JSON.stringify(z.treeifyError(error), null, 2));
  process.exit(1);
}

export default data!;
