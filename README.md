# Hono API Server

```
Based on: https://www.youtube.com/watch?app=desktop&v=sNh9PoM9sUE
```

## Drizzle

### Create DB

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit push
```

### Open Drizzle Studio

```bash
pnpm drizzle-kit studio
```

https://local.drizzle.studio

#### Tasks API

[tasks.index.ts](src/routes/tasks/tasks.index.ts)\
Connect routes and handlers

```typescript
createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(...
```

[tasks.routes.ts](src/routes/tasks/tasks.routes.ts)\
Defines routes - e.g. GET /tasks and validates the route by passing a schema\
**request** are used to validate the accepted params, e.g. /tasks/{id} and body\
**responses** are used to document all the responses this end-point handles (including errors)\
The schema can be auto generated using drizzle-zod (as in [src/db/schema](src/db/schema.ts))

```typescript
export const selectTasksSchema = createSelectSchema(tasks);
```

```typescript
{
  path: "/tasks",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: { // 200
      content: {
        "application/json": {
          schema: z.array(selectTasksSchema),
        },
      },
      description: "The list of tasks",
    },
  },
}
```

[tasks.handlers.ts](src/routes/tasks/tasks.handlers.ts)\
Respond to requests, by quering the database

```typescript
export const list: AppRouteHandler<GetRoute> = async context =>
  context.json(await db.query.tasks.findMany());
```
