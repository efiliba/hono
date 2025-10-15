import { testClient } from "hono/testing";
import { describe, expect, it } from "vitest";

import type { AppType } from "@/app";

import env from "@/env";
import { createTestApp, ZOD_ERROR_MESSAGES } from "@/lib";
import { HttpStatusCodes, HttpStatusPhrases } from "helpers";

import { users } from "./users.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient<AppType>(createTestApp(users));

const email = "a@b.com";
const firstName = "John";
const surname = "Doe";
const password = "passw0rd";

describe("users routes", () => {
  it("post /users validates the body when creating", async () => {
    const response = await client.users.$post({
      // @ts-expect-error missing required fields
      json: {
        email: "a@b.com",
      },
    });

    if (response.status !== HttpStatusCodes.UNPROCESSABLE_ENTITY) { // 422 - Added for TS narrowing
      throw new Error("Error response expected");
    }

    const { success, error } = await response.json();

    expect(success).toBe(false);
    expect(error.issues.length).toBe(3);
    expect(error.issues[0].path[0]).toBe("firstName");
    expect(error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    expect(error.issues[1].path[0]).toBe("surname");
    expect(error.issues[1].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    expect(error.issues[2].path[0]).toBe("password");
    expect(error.issues[2].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
  });

  it("post /users creates a user with a hashed password", async () => {
    const response = await client.users.$post({
      json: {
        email,
        firstName,
        surname,
        password,
      },
    });

    if (response.status !== HttpStatusCodes.CREATED) { // 201
      throw new Error("Expected user to be created");
    }

    const user = await response.json();

    expect(user.email).toBe(email);
    expect(user.firstName).toBe(firstName);
    expect(user.surname).toBe(surname);
    expect("password" in user).toBe(false);
  });

  it("post /users validates duplicate email", async () => {
    const response = await client.users.$post({
      json: {
        email,
        firstName,
        surname,
        password,
      },
    });

    if (response.status !== HttpStatusCodes.CONFLICT) { // 409
      throw new Error("Expected user creation conflict");
    }

    const { success, error } = await response.json();

    expect(success).toBe(false);
    expect(error.issues.length).toBe(1);
    expect(error.issues[0].path[0]).toBe("email");
    expect(error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.DUPLICATE_EMAIL);
  });

  it("get /users lists all users", async () => {
    const response = await client.users.$get();
    const users = await response.json();

    expect(response.status).toBe(HttpStatusCodes.OK); // 200
    expect(Array.isArray(users)).toBe(true);
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe(email);
    expect(users[0].firstName).toBe(firstName);
    expect(users[0].surname).toBe(surname);
    expect("password" in users[0]).toBe(false);
  });

  it("get /users/{email} validates the email param", async () => {
    const response = await client.users[":email"].$get({
      param: {
        // @ts-expect-error invalid email
        email: 42,
      },
    });

    if (response.status !== HttpStatusCodes.UNPROCESSABLE_ENTITY) { // 422
      throw new Error("Error response expected");
    }

    const { success, error } = await response.json();

    expect(success).toBe(false);
    expect(error.issues.length).toBe(1);
    expect(error.issues[0].path[0]).toBe("email");
    expect(error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.INVALID_EMAIL);
  });

  it("get /users/{email} returns 404 when user not found", async () => {
    const response = await client.users[":email"].$get({
      param: {
        email: "non@existant.com",
      },
    });

    if (response.status !== HttpStatusCodes.NOT_FOUND) { // 404
      throw new Error("Not found response expected");
    }

    const { message } = await response.json();

    expect(message).toBe(HttpStatusPhrases.NOT_FOUND);
  });

  it("get /users/{email} gets a single user", async () => {
    const response = await client.users[":email"].$get({
      param: {
        email,
      },
    });

    if (response.status !== HttpStatusCodes.OK) { // 200
      throw new Error("Successful response expected");
    }

    const user = await response.json();

    expect(user.email).toBe(email);
    expect(user.firstName).toBe(firstName);
    expect(user.surname).toBe(surname);
    expect("password" in user).toBe(false);
  });

  it("post /login authenticates a user and sets a cookie", async () => {
    const response = await client.login.$post({
      json: {
        email,
        password,
      },
    });

    if (response.status !== HttpStatusCodes.OK) { // 200
      throw new Error("Successful response expected");
    }

    const user = await response.json();
    const cookies = response.headers.get("Set-Cookie");

    expect(user.email).toBe(email);
    expect(user.firstName).toBe(firstName);
    expect(user.surname).toBe(surname);
    expect("password" in user).toBe(false);
    expect(cookies).toMatch(/authToken=.{20,};/);
  });

  it("post /login returns Unauthorized when password is wrong", async () => {
    const response = await client.login.$post({
      json: {
        email,
        password: "wrong_password",
      },
    });

    if (response.status !== HttpStatusCodes.UNAUTHORIZED) { // 401
      throw new Error("Unauthorized response expected");
    }

    const { message } = await response.json();

    expect(message).toBe(HttpStatusPhrases.UNAUTHORIZED);
  });

  it("get /logout deletes the cookie", async () => {
    const response = await client.logout.$get();
    const cookies = response.headers.get("Set-Cookie");

    expect(response.status).toBe(HttpStatusCodes.NO_CONTENT); // 204
    expect(cookies).toMatch(/authToken=;/); // Auth token is empty
  });
});
