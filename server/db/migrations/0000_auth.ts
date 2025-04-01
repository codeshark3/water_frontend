import { sql } from "drizzle-orm";
import { pgTable, uuid, varchar, timestamp, text } from "drizzle-orm/pg-core";

export async function up(db: any) {
  await db.schema.createTable("users")
    .addColumn("id", "uuid", { primaryKey: true, defaultValue: sql`gen_random_uuid()` })
    .addColumn("name", "varchar(255)")
    .addColumn("email", "varchar(255)", { notNull: true, unique: true })
    .addColumn("password", "text", { notNull: true })
    .addColumn("role", "varchar(50)", { defaultValue: "user" })
    .addColumn("created_at", "timestamp", { defaultValue: sql`now()` })
    .addColumn("updated_at", "timestamp", { defaultValue: sql`now()` })
    .execute();

  await db.schema.createTable("sessions")
    .addColumn("id", "uuid", { primaryKey: true, defaultValue: sql`gen_random_uuid()` })
    .addColumn("user_id", "uuid", { references: "users.id", onDelete: "cascade" })
    .addColumn("expires_at", "timestamp", { notNull: true })
    .addColumn("created_at", "timestamp", { defaultValue: sql`now()` })
    .execute();
}

export async function down(db: any) {
  await db.schema.dropTable("sessions").execute();
  await db.schema.dropTable("users").execute();
} 