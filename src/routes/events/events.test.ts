import { testClient } from "hono/testing";
import { describe, expect, it } from "vitest";

import type { AppType } from "@/app";

import env from "@/env";
import { createTestApp, ZOD_ERROR_MESSAGES } from "@/lib";
import { HttpStatusCodes } from "helpers";

import { events } from "./events.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient<AppType>(createTestApp(events));

const date = "2025-01-01";
const street = "123 Main St";
const suburb = "Anytown";
const postcode = "1234";
const today = new Date().toISOString().slice(0, 10);

describe.todo("events routes", () => {
  it("post /events validates required fields when creating", async () => {
    const response = await client.events.$post({
      // @ts-expect-error missing required fields
      json: {},
    });

    if (response.status !== HttpStatusCodes.UNPROCESSABLE_ENTITY) { // 422 - Added for TS narrowing
      throw new Error("Error response expected");
    }

    const { success, error } = await response.json();

    expect(success).toBe(false);
    expect(error.issues.length).toBe(4);
    expect(error.issues[0].path[0]).toBe("date");
    expect(error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    expect(error.issues[1].path[0]).toBe("street");
    expect(error.issues[1].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    expect(error.issues[2].path[0]).toBe("suburb");
    expect(error.issues[2].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    expect(error.issues[3].path[0]).toBe("postcode");
    expect(error.issues[3].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
  });

  it("post /events creates an event with required fields", async () => {
    const response = await client.events.$post({
      json: {
        date,
        street,
        suburb,
        postcode,
      },
    });

    if (response.status !== HttpStatusCodes.CREATED) { // 201
      throw new Error("Expected event to be created");
    }

    const event = await response.json();

    expect(Object.keys(event).length).toBe(7);
    expect(event.id).toBe(1);
    expect(event.date).toBe(date);
    expect(event.street).toBe(street);
    expect(event.suburb).toBe(suburb);
    expect(event.postcode).toBe(postcode);

    // optional fields - set to default values
    expect(event.createdAt.slice(0, 10)).toBe(today);
    expect(event.updatedAt.slice(0, 10)).toBe(today);
  });

  it("get /events lists all events", async () => {
    const response = await client.events.$get();
    const events = await response.json();

    expect(response.status).toBe(HttpStatusCodes.OK); // 200
    expect(Array.isArray(events)).toBe(true);
    expect(events).toHaveLength(1);

    const { createdAt, updatedAt, ...event } = events[0];
    expect({ ...event, createdAt: createdAt.slice(0, 10), updatedAt: updatedAt.slice(0, 10) }).toMatchObject({
      id: 1,
      date,
      street,
      suburb,
      postcode,
      createdAt: today,
      updatedAt: today,
    });
  });
});
