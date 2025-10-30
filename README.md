# Hono API Server

```
Based on: https://www.youtube.com/watch?app=desktop&v=sNh9PoM9sUE
```

## Setup

1. Install dependencies with `pnpm`

```bash
pnpm i
```

2. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

3. Run `./start-database.sh` to start the database.

4. Run `./start-redis.sh` to start the Redis server.

## Drizzle

### Create DB

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit push
```

### Start the development server
```bash
pnpm dev
```

### Open Drizzle Studio

```bash
pnpm drizzle-kit studio
```

https://local.drizzle.studio

## Scalar
http://localhost:9999/reference

### Setup Test Database

1. The schema files should already exist or use: 
```bash
pnpm db:generate
pnpm db:push
```

2. Run the tests
```bash
pnpm test
```

3. View the test databases (deleted by vitest.setup.ts)
```bash
psql "postgres://username:password@localhost:5432/postgres" \
  -c "SELECT datname FROM pg_database WHERE datname LIKE 'test_db%' ORDER BY datname;"
```

4. Drop all test databases
```bash
ADMIN_URL="postgres://username:password@localhost:5432/postgres"
for db in $(psql "$ADMIN_URL" -t -A -c "SELECT datname FROM pg_database WHERE datname LIKE 'test_db%'"); do
  psql "$ADMIN_URL" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$db' AND pid <> pg_backend_pid();"
  psql "$ADMIN_URL" -c "DROP DATABASE IF EXISTS \"$db\";"
done
```

5. Check the contents of the test database
```bash
psql "postgres://username:password@localhost:5432/test_db_..." \
  -c "SELECT * FROM users"
```

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
