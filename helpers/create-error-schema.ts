import { z } from "@hono/zod-openapi";

export type ZodSchema = z.ZodTypeAny;

export function createErrorSchema<T extends ZodSchema>(schema: T) {
  // Pass undefined to reliably trigger a validation error across all schema types
  const { error } = schema.safeParse(undefined);

  return z.object({
    success: z.boolean().openapi({ example: false }),
    error: z
      .object({
        issues: z.array(
          z.object({
            code: z.string(),
            path: z.array(z.union([z.string(), z.number()])),
            message: z.string().optional(),
          }),
        ),
        name: z.string(),
      })
      .openapi({ example: error }),
  });
}
