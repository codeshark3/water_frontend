import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { tests, user } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "crypto";

const PayloadSchema = z.object({
  participantId: z.string().optional(),
  name: z.string().optional(),
  age: z.coerce.number().int().optional(),
  gender: z.string().optional(),
  location: z.string().optional(),
  createdAt: z.string().optional(),
  createdBy: z.string().optional(),
  userId: z.string().optional(),  // Direct user ID for foreign key reference
  existingTestId: z.string().optional(), // For updates
  // Accept either direct status strings or numeric codes 1/2
  oncho: z.union([z.string(), z.number()]).nullable().optional(),
  schistosomiasis: z.union([z.string(), z.number()]).nullable().optional(),
  lf: z.union([z.string(), z.number()]).nullable().optional(),
  helminths: z.union([z.string(), z.number()]).nullable().optional(),
  id: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = PayloadSchema.parse(json);

    // Check if this is an update (existingTestId provided)
    const isUpdate = !!data.existingTestId;
    const id = isUpdate ? data.existingTestId! : (data.id ?? randomUUID().replace(/-/g, ""));

    const createdAt = data.createdAt ? new Date(data.createdAt) : new Date();

    const mapResult = (v: unknown): string | null => {
      if (v === null || v === undefined) return null;
      if (typeof v === "number") return v === 2 ? "positive" : v === 1 ? "negative" : null;
      const s = String(v).toLowerCase();
      if (s === "2") return "positive";
      if (s === "1") return "negative";
      if (s === "positive" || s === "negative") return s;
      return null;
    };

    // Resolve user ID for foreign key reference
    let userId: string;
    if (data.userId) {
      // Direct user ID provided (preferred method)
      userId = data.userId;
    } else if (data.createdBy) {
      // Look up user by email
      const owner = await db.query.user.findFirst({ where: (m, { eq }) => eq(m.email, data.createdBy!) });
      if (!owner) {
        return NextResponse.json({ ok: false, error: "User not found for createdBy email" }, { status: 400 });
      }
      userId = owner.id;
    } else {
      // Fallback to participantId if no user info provided
      userId = data.participantId || "unknown_user";
    }

    if (isUpdate) {
      // Update existing test - only update fields that are provided
      const updateData: any = {
        updatedAt: new Date(),
      };

      // Only include fields that are actually provided
      if (data.participantId !== undefined) updateData.participantId = data.participantId;
      if (data.name !== undefined) updateData.name = data.name;
      if (data.gender !== undefined) updateData.gender = data.gender;
      if (data.age !== undefined) updateData.age = data.age;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.createdAt !== undefined) updateData.date = createdAt;
      if (data.userId !== undefined) updateData.userId = userId;
      if (data.createdBy !== undefined) updateData.createdByName = data.createdBy;
      if (data.oncho !== undefined) updateData.oncho = mapResult(data.oncho);
      if (data.schistosomiasis !== undefined) updateData.schistosomiasis = mapResult(data.schistosomiasis);
      if (data.lf !== undefined) updateData.lf = mapResult(data.lf);
      if (data.helminths !== undefined) updateData.helminths = mapResult(data.helminths);

      await db.update(tests)
        .set(updateData)
        .where(eq(tests.id, id));
    } else {
      // Insert new test
      await db.insert(tests).values({
        id,
        participantId: data.participantId ?? null,
        name: data.name ?? null,
        gender: data.gender ?? null,
        age: data.age ?? null,
        location: data.location ?? null,
        date: createdAt,
        userId: userId,
        createdByName: data.createdBy ?? null,
        oncho: mapResult(data.oncho),
        schistosomiasis: mapResult(data.schistosomiasis),
        lf: mapResult(data.lf),
        helminths: mapResult(data.helminths),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ ok: true, id, table: "water_ml_tests" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message ?? "Unknown error" }, { status: 400 });
  }
}


