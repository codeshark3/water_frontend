
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
