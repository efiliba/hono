import { reset, seed } from "drizzle-seed";

import { db, pool } from "@/db";
import { events, userEvents, users } from "@/db/schemas";

const startOfCurrentYear = new Date(new Date().getFullYear(), 0, 1);
const endOfCurrentYear = new Date(new Date().getFullYear(), 11, 31);

const getDistinctRandomValues = <T>(array: T[], n: number) =>
  array.sort(() => Math.random() - 0.5).slice(0, n);

const getRandomDate = (from = startOfCurrentYear, to = endOfCurrentYear) =>
  new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime())).toISOString();

export const seedDb = async () => {
  await reset(db, { users, events, userEvents });

  await seed(db, { users, events }).refine(f => ({
    users: {
      columns: {
        height: f.int({ minValue: 60, maxValue: 260 }),
        weight: f.int({ minValue: 20, maxValue: 500 }),
        elo: f.int({ minValue: 0, maxValue: 2000 }),
      },
      count: 10,
    },
    events: {
      columns: {
        postcode: f.int({ minValue: 1000, maxValue: 9999 }),
        street: f.streetAddress(),
        suburb: f.valuesFromArray({
          values: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Hobart", "Darwin", "Canberra"],
        }),
        date: f.date({ minDate: startOfCurrentYear, maxDate: endOfCurrentYear }),
      },
      count: 3,
    },
  }));

  const [availableUsers, availableEvents] = await Promise.all([
    db.select({ id: users.id }).from(users),
    db.select({ id: events.id }).from(events),
  ]);

  const usersAtEachEvent = [5, 4, 6];

  await db.insert(userEvents).values(availableEvents.flatMap((event, index) =>
    getDistinctRandomValues(availableUsers, usersAtEachEvent[index]).map(value => ({
      userId: value.id,
      eventId: event.id,
      dateRegistered: getRandomDate(),
    })),
  ));
};

seedDb().then(() => {
  // eslint-disable-next-line no-console
  console.log("Database seeded successfully");
  return pool.end();
}).catch((error) => {
  console.error("Error seeding database:", error);
  return pool.end();
});
