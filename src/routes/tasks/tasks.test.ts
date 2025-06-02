/* eslint-disable ts/ban-ts-comment */
import { testClient } from "hono/testing";
// import { execSync } from "node:child_process";
// import fs from "node:fs";
// import { afterAll, beforeAll, describe, expect, expectTypeOf, it } from "vitest";
import { describe, expect, it } from "vitest";

import env from "@/env";
import { createTestApp, ZOD_ERROR_MESSAGES } from "@/lib";
import { HttpStatusCodes, HttpStatusPhrases } from "helpers";

import { tasks } from "./tasks.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

interface TasksTestClient {
  tasks: {
    "$get": () => Promise<Response>;
    "$post": (args: { json: { name: string; done: boolean } }) => Promise<Response>;
    ":id": {
      $get: (args: { param: { id: number } }) => Promise<Response>;
      $patch: (args: { param: { id: number }; json: { name?: string; done?: boolean } }) => Promise<Response>;
      $delete: (args: { param: { id: number } }) => Promise<Response>;
    };
  };
}

const client = testClient(createTestApp(tasks)) as TasksTestClient;

// const testClientTypeApp = createApp();
//    ^?
// const testClientTypeRouter = testClientTypeApp.route("/", router);
// //    ^?
// const testClientType = testClient(testClientTypeRouter);
// //    ^?

describe("tasks routes", () => {
  // beforeAll(async () => {
  //   execSync("pnpm drizzle-kit push");
  // });

  // afterAll(async () => {
  //   fs.rmSync("test.db", { force: true });
  // });

  it("post /tasks validates the body when creating", async () => {
    const response = await client.tasks.$post({
      // @ts-expect-error
      json: {
        done: false,
      },
    });
    const { error } = await response.json();

    expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY); // 422

    expect(error.issues[0].path[0]).toBe("name");
    expect(error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
  });

  const id = 1;
  const name = "Learn vitest";

  it("post /tasks creates a task", async () => {
    const response = await client.tasks.$post({
      json: {
        name,
        done: false,
      },
    });
    const json = await response.json();

    expect(response.status).toBe(HttpStatusCodes.CREATED); // 201
    expect(json.name).toBe(name);
    expect(json.done).toBe(false);
  });

  it("get /tasks lists all tasks", async () => {
    const response = await client.tasks.$get();
    const json = await response.json();
    expect(response.status).toBe(HttpStatusCodes.OK); // 200
    // expectTypeOf(json).toBeArray();
    expect(Array.isArray(json)).toBe(true);
    expect(json).toHaveLength(1);
  });

  it("get /tasks/{id} validates the id param", async () => {
    const response = await client.tasks[":id"].$get({
      param: {
        // @ts-expect-error
        id: "wat",
      },
    });
    const { error } = await response.json();

    expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY); // 422;
    expect(error.issues[0].path[0]).toBe("id");
    expect(error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
  });

  it("get /tasks/{id} returns 404 when task not found", async () => {
    const response = await client.tasks[":id"].$get({
      param: {
        id: 999,
      },
    });
    const { message } = await response.json();

    expect(response.status).toBe(HttpStatusCodes.NOT_FOUND); // 404
    expect(message).toBe(HttpStatusPhrases.NOT_FOUND);
  });

  it("get /tasks/{id} gets a single task", async () => {
    const response = await client.tasks[":id"].$get({
      param: {
        id,
      },
    });
    const json = await response.json();

    expect(response.status).toBe(HttpStatusCodes.OK); // 200
    expect(json.name).toBe(name);
    expect(json.done).toBe(false);
  });

  // it("patch /tasks/{id} validates the body when updating", async () => {
  //   const response = await client.tasks[":id"].$patch({
  //     param: {
  //       id,
  //     },
  //     json: {
  //       name: "",
  //     },
  //   });
  //   const { error } = await response.json();

  //   expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY) // 422;
  //   expect(error.issues[0].path[0]).toBe("name");
  //   expect(error.issues[0].code).toBe(ZodIssueCode.too_small);
  // });

  it("patch /tasks/{id} validates the id param", async () => {
    const response = await client.tasks[":id"].$patch({
      param: {
        // @ts-expect-error
        id: "wat",
      },
      json: {},
    });
    expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY); // 422;
    if (response.status === HttpStatusCodes.UNPROCESSABLE_ENTITY) { // Added for TS narrowing
      const { error } = await response.json();
      expect(error.issues[0].path[0]).toBe("id");
      expect(error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    }
  });

  // it("patch /tasks/{id} validates empty body", async () => {
  //   const response = await client.tasks[":id"].$patch({
  //     param: {
  //       id,
  //     },
  //     json: {},
  //   });
  //   expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY) // 422;
  //   if (response.status === HttpStatusCodes.UNPROCESSABLE_ENTITY) {
  //     const json = await response.json();
  //     expect(json.error.issues[0].code).toBe(ZOD_ERROR_CODES.INVALID_UPDATES);
  //     expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.NO_UPDATES);
  //   }
  // });

  it("patch /tasks/{id} updates a single property of a task", async () => {
    const response = await client.tasks[":id"].$patch({
      param: {
        id,
      },
      json: {
        done: true,
      },
    });
    const { done } = await response.json();

    expect(response.status).toBe(HttpStatusCodes.OK); // 200
    expect(done).toBe(true);
  });

  it("delete /tasks/{id} validates the id when deleting", async () => {
    const response = await client.tasks[":id"].$delete({
      param: {
        // @ts-expect-error
        id: "wat",
      },
    });
    const { error } = await response.json();

    expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY); // 422
    expect(error.issues[0].path[0]).toBe("id");
    expect(error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
  });

  it("delete /tasks/{id} removes a task", async () => {
    const response = await client.tasks[":id"].$delete({
      param: {
        id,
      },
    });

    expect(response.status).toBe(HttpStatusCodes.NO_CONTENT); // 204
  });
});
