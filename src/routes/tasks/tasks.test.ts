import { testClient } from "hono/testing";
import { describe, expect, it } from "vitest";

import type { AppType } from "@/app";

import env from "@/env";
import { createTestApp, ZOD_ERROR_MESSAGES } from "@/lib";
import { HttpStatusCodes, HttpStatusPhrases } from "helpers";

import { tasks } from "./tasks.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient<AppType>(createTestApp(tasks));

const id = 1;
const name = "Task todo 😀";

describe("tasks routes", () => {
  it("post /tasks validates the body when creating", async () => {
    const response = await client.tasks.$post({
      // @ts-expect-error missing required fields
      json: {
        done: false,
      },
    });

    if (response.status !== HttpStatusCodes.UNPROCESSABLE_ENTITY) { // 422 - Added for TS narrowing
      throw new Error("Error response expected");
    }

    const { success, error } = await response.json();

    expect(success).toBe(false);
    expect(error.issues.length).toBe(1);
    expect(error.issues[0].path[0]).toBe("name");
    expect(error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
  });

  it("post /tasks creates a task", async () => {
    const response = await client.tasks.$post({
      json: {
        name,
        done: false,
      },
    });

    if (response.status !== HttpStatusCodes.CREATED) { // 201
      throw new Error("Task response expected");
    }

    const task = await response.json();

    expect(task.name).toBe(name);
    expect(task.done).toBe(false);
  });

  it("get /tasks lists all tasks", async () => {
    const response = await client.tasks.$get();
    const task = await response.json();

    expect(response.status).toBe(HttpStatusCodes.OK); // 200
    expect(Array.isArray(task)).toBe(true);
    expect(task).toHaveLength(1);
    expect(task[0].name).toBe(name);
    expect(task[0].done).toBe(false);
  });

  it("get /tasks/{id} validates the id param", async () => {
    const response = await client.tasks[":id"].$get({
      param: {
        // @ts-expect-error invalid id
        id: "wat" satisfies number,
      },
    });

    if (response.status !== HttpStatusCodes.UNPROCESSABLE_ENTITY) { // 422;
      throw new Error("Error response expected");
    }

    const { success, error } = await response.json();

    expect(success).toBe(false);
    expect(error.issues[0].path[0]).toBe("id");
    expect(error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
  });

  it("get /tasks/{id} returns 404 when task not found", async () => {
    const response = await client.tasks[":id"].$get({
      param: {
        id: 999,
      },
    });

    if (response.status !== HttpStatusCodes.NOT_FOUND) { // 404
      throw new Error("Not found response expected");
    }

    const { message } = await response.json();

    expect(message).toBe(HttpStatusPhrases.NOT_FOUND);
  });

  it("get /tasks/{id} gets a single task", async () => {
    const response = await client.tasks[":id"].$get({
      param: {
        id,
      },
    });

    if (response.status !== HttpStatusCodes.OK) { // 200
      throw new Error("Successful response expected");
    }

    const task = await response.json();

    expect(task.name).toBe(name);
    expect(task.done).toBe(false);
  });

  it("patch /tasks/{id} validates the body when updating", async () => {
    const response = await client.tasks[":id"].$patch({
      param: {
        id,
      },
      json: {
        name: "",
      },
    });

    if (response.status !== HttpStatusCodes.UNPROCESSABLE_ENTITY) { // 422;
      throw new Error("Error response expected");
    }

    const { success, error } = await response.json();

    expect(success).toBe(false);
    expect(error.issues.length).toBe(1);
    expect(error.issues[0].path[0]).toBe("name");
    expect(error.issues[0].code).toBe("too_small");
  });

  it("patch /tasks/{id} validates the id param", async () => {
    const response = await client.tasks[":id"].$patch({
      param: {
        // @ts-expect-error invalid id
        id: "wat" satisfies number,
      },
      json: {},
    });

    if (response.status !== HttpStatusCodes.UNPROCESSABLE_ENTITY) { // 422
      throw new Error("Error response expected");
    }

    const { success, error } = await response.json();

    expect(success).toBe(false);
    expect(error.issues.length).toBe(1);
    expect(error.issues[0].path[0]).toBe("id");
    expect(error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
  });

  it("patch /tasks/{id} validates empty body", async () => {
    const response = await client.tasks[":id"].$patch({
      param: {
        id,
      },
      json: {},
    });

    if (response.status !== HttpStatusCodes.UNPROCESSABLE_ENTITY) { // 422;
      throw new Error("Error response expected");
    }

    const { success, error } = await response.json();

    expect(success).toBe(false);
    expect(error.issues[0].code).toBe("invalid_type");
    expect(error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.NO_UPDATES);
  });

  it("patch /tasks/{id} updates a single property of a task", async () => {
    const response = await client.tasks[":id"].$patch({
      param: {
        id,
      },
      json: {
        done: true,
      },
    });

    if (response.status !== HttpStatusCodes.OK) { // 200
      throw new Error("Task response expected");
    }

    const task = await response.json();

    expect(task.done).toBe(true);
  });

  it("delete /tasks/{id} validates the id when deleting", async () => {
    const response = await client.tasks[":id"].$delete({
      param: {
        // @ts-expect-error invalid id
        id: "wat" satisfies number,
      },
    });

    if (response.status !== HttpStatusCodes.UNPROCESSABLE_ENTITY) { // 422
      throw new Error("Error response expected");
    }

    const { success, error } = await response.json();

    expect(success).toBe(false);
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
