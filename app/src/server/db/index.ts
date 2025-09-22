// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres from "postgres";

// import { env } from "~/env";
// import * as schema from "./schema";

// /**
//  * Cache the database connection in development. This avoids creating a new connection on every HMR
//  * update.
//  */
// const globalForDb = globalThis as unknown as {
//   conn: postgres.Sql | undefined;
// };

// const conn = globalForDb.conn ?? postgres(env.POSTGRES_URL);
// if (env.NODE_ENV !== "production") globalForDb.conn = conn;

// export const db = drizzle(conn, { schema });
// ************** local *******************
import pg from "pg";
// import { drizzle } from "drizzle-orm/vercel-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
// import { sql } from "@vercel/postgres";

import * as schema from "./schema";

const pool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL!,
});
//const db = drizzle(pool);

// Use this object to send drizzle queries to your DBlogger: true casing: "snake_case" { schema }
export const db = drizzle(pool, { schema });


// src/db.ts
// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres from "postgres";
// import { config } from "dotenv";
// import * as schema from "./schema";

// config({ path: ".env" }); // or .env.local

// const connectionString = process.env.POSTGRES_URL!;

// // For production, use connection pooling
// const sql = postgres(connectionString, {
//   max: 1,  // Use a single connection in production
//   prepare: false,
//   // If you want to print debug info
//   // debug: true,
// });

// export const db = drizzle(sql, { schema });