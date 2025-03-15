import { type Config } from "drizzle-kit";
import { env } from "./env";

export default {
  schema: "./server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.POSTGRES_URL,
  },
  tablesFilter: ["water_ml_*"],
  verbose: true,
  // introspect: {
  //   casing: "camel", // or "preserve"
  // },
  strict: true,
} satisfies Config;
