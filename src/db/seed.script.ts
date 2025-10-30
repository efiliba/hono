import { reset, seed } from "drizzle-seed";

import { db, pool } from "@/db";
import * as schema from "@/db/schemas";

export const seedDb = async () => {
  await reset(db, schema);

  await seed(db, schema).refine(funcs => ({
    users: {
      columns: {
        height: funcs.int({ minValue: 60, maxValue: 260 }),
      },
      count: 10,
      with: {
        userEvents: 1,
      },
    },
    events: {
      columns: {
        postcode: funcs.int({ minValue: 1000, maxValue: 9999 }),
        // street: funcs.text({ length: { min: 1, max: 255 } }),
        suburb: funcs.valuesFromArray({
          values: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Hobart", "Darwin", "Canberra"],
        }),
        date: funcs.date({ minDate: new Date("2025-01-01"), maxDate: new Date("2025-12-31") }),
      },
      count: 2,
    },
    tasks: {
      count: 0,
    },
  }));
};

seedDb().then(() => {
  console.log("Database seeded successfully");
  return pool.end();
}).catch((error) => {
  console.error("Error seeding database:", error);
  return pool.end();
});
