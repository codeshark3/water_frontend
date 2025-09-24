// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { time } from "console";
import { sql } from "drizzle-orm";
import { int } from "drizzle-orm/mysql-core";
import {
  index,
  text,
  boolean,
  integer,
  pgTableCreator,
  timestamp,
  varchar,
  serial,
  pgTable,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `water_ml_${name}`);

export const user = createTable("user", {
  id: text("id").primaryKey(),
  name: varchar("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("banReason"),
  banExpires: integer("banExpires"),
});

export const session = createTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token"),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  impersonatedBy: text("impersonatedBy"),
});

export const account = createTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
  password: text("password"),
});

export const verification = createTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export const tests =createTable("tests", {
  id: text("id").primaryKey(),
  participantId: text("participantId"), // Add participantId field
  name: text("name"),
  gender: text("gender"),
  age: integer("age"),
  location: text("location"),
  date: timestamp("date"),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  oncho: text("oncho"),
  schistosomiasis: text("schistosomiasis"),
  lf: text("lf"),
  helminths: text("helminths"),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

export const forecasts = createTable("forecasts", {
  id: text("id").primaryKey(),
  diseaseType: text("diseaseType").notNull(), // 'oncho', 'schistosomiasis', 'lf', 'helminths'
  month: text("month").notNull(), // Format: 'YYYY-MM'
  isForecast: boolean("isForecast").notNull().default(false), // true for forecast data, false for historical
  totalTests: integer("totalTests"), // Only for historical data
  positiveCases: integer("positiveCases"), // Only for historical data
  infectionRate: integer("infectionRate"), // Percentage, only for historical data
  forecastedInfectionRate: integer("forecastedInfectionRate"), // Percentage, only for forecast data
  forecastedPositiveCases: integer("forecastedPositiveCases"), // Only for forecast data
  forecastedTotalTests: integer("forecastedTotalTests"), // Only for forecast data
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// Mobile results are now saved directly to the tests table as the single source of truth
