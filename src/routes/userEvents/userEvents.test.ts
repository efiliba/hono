import { testClient } from "hono/testing";
import { describe, expect, it } from "vitest";

import type { AppType } from "@/app";

import env from "@/env";
import { createTestApp, ZOD_ERROR_MESSAGES } from "@/lib";
import { HttpStatusCodes } from "helpers";

import { events } from "../events/events.index";
import { users } from "../users/users.index";
import { userEvents } from "./userEvents.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient<AppType>(createTestApp(userEvents));
const userClient = testClient<AppType>(createTestApp(users));
const eventClient = testClient<AppType>(createTestApp(events));

const today = new Date().toISOString().slice(0, 10);

describe.todo("userEvents routes", () => {
  it("post /user-events validates required fields when creating", async () => {
    const response = await client["user-events"].$post({
      // @ts-expect-error missing required fields
      json: {},
    });
    if (response.status !== HttpStatusCodes.UNPROCESSABLE_ENTITY) { // 422 - Added for TS narrowing
      throw new Error("Error response expected");
    }

    const { success, error } = await response.json();

    expect(success).toBe(false);
    expect(error.issues.length).toBe(3);
    expect(error.issues[0].path[0]).toBe("userId");
    expect(error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER_BUT_UNDEFINED);
    expect(error.issues[1].path[0]).toBe("eventId");
    expect(error.issues[1].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER_BUT_UNDEFINED);
    expect(error.issues[2].path[0]).toBe("dateRegistered");
    expect(error.issues[2].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
  });

  it("post /user-events creates a user event if the user and event already exist", async () => {
    const dateRegistered = "2025-01-02";

    const userResponse = await userClient.users.$post({
      json: {
        firstName: "John",
        surname: "Doe",
        email: "a@b.com",
        phone: "0412345678",
        password: "passw0rd",
      },
    });

    if (userResponse.status !== HttpStatusCodes.CREATED) { // 201
      throw new Error("Expected event to be created");
    }

    const user = await userResponse.json();

    const eventResponse = await eventClient.events.$post({
      json: {
        date: "2025-01-01",
        street: "123 Main St",
        suburb: "Anytown",
        postcode: "1234",
      },
    });

    if (eventResponse.status !== HttpStatusCodes.CREATED) { // 201
      throw new Error("Expected event to be created");
    }

    const event = await eventResponse.json();

    const response = await client["user-events"].$post({
      json: {
        userId: user.id,
        eventId: event.id,
        dateRegistered,
      },
    });

    if (response.status !== HttpStatusCodes.CREATED) { // 201
      throw new Error("Expected user event to be created");
    }

    const userEvent = await response.json();

    expect(Object.keys(userEvent).length).toBe(5);
    expect(userEvent.userId).toBe(user.id);
    expect(userEvent.eventId).toBe(event.id);
    expect(userEvent.dateRegistered).toBe(dateRegistered);
    expect(userEvent.createdAt.slice(0, 10)).toBe(today);
    expect(userEvent.updatedAt.slice(0, 10)).toBe(today);
  });
});
