"use server";

import { db } from "~/server/db";
import { user as userTable, account as accountTable, session as sessionTable } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function updateUserAction(
  userId: string,
  data: { name?: string; email?: string; role?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!userId) return { ok: false, error: "Missing user id" };

  const existing = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
  });
  if (!existing) return { ok: false, error: "User not found" };

  const updates: Record<string, unknown> = {};
  if (typeof data.name === "string") updates.name = data.name;
  if (typeof data.email === "string") updates.email = data.email;
  if (typeof data.role === "string") updates.role = data.role;
  updates.updatedAt = new Date();

  const [updated] = await db
    .update(userTable)
    .set(updates)
    .where(eq(userTable.id, userId))
    .returning();

  if (!updated) return { ok: false, error: "Update failed" };
  return { ok: true };
}

export async function deleteUserAction(
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!userId) return { ok: false, error: "Missing user id" };
  const existing = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
  });
  if (!existing) return { ok: false, error: "User not found" };

  // Remove auth artifacts (accounts/sessions) first to satisfy FK constraints
  await db.delete(accountTable).where(eq(accountTable.userId, userId));
  await db.delete(sessionTable).where(eq(sessionTable.userId, userId));

  // Soft-delete the user to preserve related tests (FK from tests -> user)
  const [updated] = await db
    .update(userTable)
    .set({ banned: true, updatedAt: new Date() })
    .where(eq(userTable.id, userId))
    .returning();

  if (!updated) return { ok: false, error: "Delete failed" };
  return { ok: true };
}

