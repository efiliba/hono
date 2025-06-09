import { z } from "@hono/zod-openapi";

export type ZodSchema = z.ZodUnion<[z.ZodTypeAny]> | z.AnyZodObject | z.ZodArray<z.AnyZodObject> | z.ZodEffects<any, any, any>;

export function createErrorSchema<T extends ZodSchema>(schema: T) {
  const { error } = schema.safeParse(schema._def.typeName === z.ZodFirstPartyTypeKind.ZodArray ? [] : {});

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
