"use server";
import { db } from "./db";
import * as z from "zod";
import { and, count, eq, sql } from "drizzle-orm";
import {
  accessRequestSchema,
  datasetInsertSchema,
  datasetSchema,
} from "~/schemas/index";
import {
  dataset,
  tags,
  datasetTags,
  access_request,
  user,
  saved_dataset,
} from "./db/schema";
import { checkSavedDataset, saveDataset } from "./dataset_queries";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { title } from "process";
import { revalidatePath } from "next/cache";

export async function insertAccessRequest({
  values,
  datasetId,
}: {
  values: z.infer<typeof accessRequestSchema>;
  datasetId: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user_id = session?.user.id;
  if (!user_id) {
    return { error: "Not authenticated!" };
  }

  // Check for existing pending request
  const hasPending = await hasExistingPendingRequest(user_id, datasetId);
  if (hasPending) {
    return { error: "You already have a pending request for this dataset" };
  }

  const validatedFields = accessRequestSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid Fields!" };
  }

  const isSaved = await checkSavedDataset(datasetId);
  if (!isSaved) {
    await saveDataset(datasetId);
  }
  const { reason } = validatedFields.data;
  try {
    await db.insert(access_request).values({
      reason: reason ?? "",
      userId: user_id,
      datasetId: datasetId,
      status: "pending",
    });

    revalidatePath(`/datasets/${datasetId}`);
    return { success: "Access request submitted successfully!" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to submit access request!" };
  }
}

export async function getAllAccessRequests() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user_role = session?.user.role;

  if (user_role === "admin" || user_role === "staff") {
    const accessRequests = await db
      .select({
        user_name: user.name,
        id: access_request.id,
        reason: access_request.reason,
        status: access_request.status,
        createdAt: sql<string>`to_char(${access_request.createdAt}, 'YYYY-MM-DD HH24:MI:SS')`,
      })
      .from(access_request)
      .innerJoin(user, eq(access_request.userId, user.id));
    return accessRequests;
  } else {
    return {
      error: "You are not authorized to view this page!",
    };
  }
}

export async function getAllUserAccessRequests() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user_id = session?.user.id;
  const accessRequests = await db
    .select({
      id: access_request.id,
      createdAt: sql<string>`to_char(${access_request.createdAt}, 'YYYY-MM-DD HH24:MI:SS')`,

      userId: access_request.userId,
      datasetId: access_request.datasetId,
      reason: access_request.reason,
      status: access_request.status,
      dataset_title: dataset.title,
    })
    .from(access_request)
    .innerJoin(dataset, eq(access_request.datasetId, dataset.id))
    .where(eq(access_request.userId, user_id ?? ""));
  return accessRequests;
}

export async function updateAccessRequestStatus({
  id,
  status,
}: {
  id: number;
  status: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user_role = session?.user.role;
  if (user_role === "admin" || user_role === "staff") {
    const accessRequest = await db
      .update(access_request)
      .set({ status })
      .where(eq(access_request.id, id));
    return { success: "Access request updated successfully!" };
  } else {
    return {
      error: "You are not authorized to update this access request!",
    };
  }
}

export async function getAccessRequestById(id: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user_role = session?.user.role;
  if (user_role === "admin" || user_role === "staff") {
    const accessRequest = await db
      .select({
        access_request_id: access_request.id,
        user_name: user.name,
        user_email: user.email,
        dataset_title: dataset.title,
        dataset_id: dataset.id,
        dataset_pi: dataset.pi_name,
        dataset_year: dataset.year,
        dataset_division: dataset.division,
        reason: access_request.reason,
        request_status: access_request.status,
        createdAt: sql<string>`to_char(${access_request.createdAt}, 'YYYY-MM-DD HH24:MI:SS')`,
      })
      .from(access_request)
      .innerJoin(user, eq(access_request.userId, user.id))
      .innerJoin(dataset, eq(access_request.datasetId, dataset.id))
      .where(eq(access_request.id, id));

    return accessRequest;
  } else {
    return {
      error: "You are not authorized to view this access request!",
    };
  }
}

async function hasExistingPendingRequest(userId: string, datasetId: string) {
  const existingRequest = await db
    .select()
    .from(access_request)
    .where(
      and(
        eq(access_request.userId, userId),
        eq(access_request.datasetId, datasetId),
        eq(access_request.status, "pending"),
      ),
    );
  return existingRequest.length > 0;
}

export async function checkPendingRequest(datasetId: string, user_id: string) {
  if (!user_id) return false;

  return hasExistingPendingRequest(user_id, datasetId);
}

export async function hasApprovedAccess(datasetId: string, user_id: string) {
  if (!user_id) return false;

  const request = await db
    .select()
    .from(access_request)
    .where(
      and(
        eq(access_request.userId, user_id),
        eq(access_request.datasetId, datasetId),
        eq(access_request.status, "approved"),
      ),
    );

  return request.length > 0;
}

export async function getAllUserAccessRequestCounts() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user_id = session?.user.id;

  const counts = await db
    .select({
      status: access_request.status,
      count: count(),
    })
    .from(access_request)
    .where(eq(access_request.userId, user_id ?? ""))
    .groupBy(access_request.status);
  return counts;
}
