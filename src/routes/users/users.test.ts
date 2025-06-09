// /* eslint-disable ts/ban-ts-comment */
import { testClient } from "hono/testing";
import { describe, expect, it } from "vitest";

import type { InsertUser } from "@/db/types";

import env from "@/env";
import { createTestApp, ZOD_ERROR_MESSAGES } from "@/lib";
import { HttpStatusCodes, HttpStatusPhrases } from "helpers";

import { users } from "./users.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

interface UsersTestClient {
  login: {
    $post: (args: { json: { email: string; password: string } }) => Promise<Response>;
  };
  logout: {
    $get: () => Promise<Response>;
  };
  users: {
    "$get": () => Promise<Response>;
    "$post": (args: { json: InsertUser }) => Promise<Response>;
    ":email": {
      $get: (args: { param: { email: string } }) => Promise<Response>;
    };
  };
}

const client = testClient(createTestApp(users)) as UsersTestClient;

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
    const { error } = await response.json();

    expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY); // 422

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
    const user = await response.json();

    expect(response.status).toBe(HttpStatusCodes.CREATED); // 201
    expect(user.email).toBe(email);
    expect(user.firstName).toBe(firstName);
    expect(user.surname).toBe(surname);
    expect(user.password).toBeUndefined();
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
    const { error } = await response.json();

    expect(response.status).toBe(HttpStatusCodes.CONFLICT); // 409
    expect(error.issues[0].path[0]).toBe("email");
    expect(error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.DUPLICATE_EMAIL);
  });

  it("get /users lists all users", async () => {
    const response = await client.users.$get();
    const users = await response.json();

    expect(response.status).toBe(HttpStatusCodes.OK); // 200
    expect(Array.isArray(users)).toBe(true);
    expect(users).toHaveLength(1);
    expect(users[0].password).toBeUndefined();
  });

  it("get /users/{email} validates the email param", async () => {
    const response = await client.users[":email"].$get({
      param: {
        // @ts-expect-error invalid email
        email: 42,
      },
    });
    const { error } = await response.json();

    expect(response.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY); // 422;
    expect(error.issues[0].path[0]).toBe("email");
    expect(error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.INVALID_EMAIL);
  });

  it("get /users/{email} returns 404 when user not found", async () => {
    const response = await client.users[":email"].$get({
      param: {
        email: "non@existant.com",
      },
    });
    const { message } = await response.json();

    expect(response.status).toBe(HttpStatusCodes.NOT_FOUND); // 404
    expect(message).toBe(HttpStatusPhrases.NOT_FOUND);
  });

  it("get /users/{email} gets a single user", async () => {
    const response = await client.users[":email"].$get({
      param: {
        email,
      },
    });
    const user = await response.json();

    expect(response.status).toBe(HttpStatusCodes.OK); // 200
    expect(user.email).toBe(email);
    expect(user.firstName).toBe(firstName);
    expect(user.surname).toBe(surname);
    expect(user.password).toBeUndefined();
  });

  it("post /login authenticates a user and sets a cookie", async () => {
    const response = await client.login.$post({
      json: {
        email,
        password,
      },
    });
    const cookies = response.headers.get("Set-Cookie");
    const user = await response.json();

    expect(response.status).toBe(HttpStatusCodes.OK); // 200
    expect(user.email).toBe(email);
    expect(user.firstName).toBe(firstName);
    expect(user.surname).toBe(surname);
    expect(user.password).toBeUndefined();
    expect(cookies).toMatch(/authToken=.{20,};/);
  });

  it("post /login returns Unauthorized when password is wrong", async () => {
    const response = await client.login.$post({
      json: {
        email,
        password: "wrong_password",
      },
    });
    const { message } = await response.json();

    expect(response.status).toBe(HttpStatusCodes.UNAUTHORIZED); // 401
    expect(message).toBe(HttpStatusPhrases.UNAUTHORIZED);
  });

  it("get /logout deletes the cookie", async () => {
    const response = await client.logout.$get();
    const cookies = response.headers.get("Set-Cookie");

    expect(response.status).toBe(HttpStatusCodes.NO_CONTENT); // 204
    expect(cookies).toMatch(/authToken=;/); // Auth token is empty
  });
});
