// import "server-only";
"use server";
import { db } from "./db";
import * as z from "zod";
import { and, eq, ilike, or } from "drizzle-orm";
import {
  datasetInsertSchema,
  datasetSchema,
  papersSchema,
} from "~/schemas/index";
import {
  dataset,
  tags,
  datasetTags,
  saved_dataset,
  access_request,
  //  papers,
} from "./db/schema";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { title } from "process";
import { revalidatePath } from "next/cache";
export async function insertDataset({
  values,
  fileUrl,
  datasetId,
}: {
  values: z.infer<typeof datasetSchema>;
  fileUrl: string;
  datasetId: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user_id = session?.user.id;
  const validatedFields = datasetSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid Fields!" };
  }
  const { title, year, pi_name, description, division, papers, tags } =
    validatedFields.data;

  try {
    await db.insert(dataset).values({
      id: datasetId,
      title,
      year,
      pi_name,
      description,
      division,
      papers: JSON.stringify(papers),
      tags,
      user_id: user_id,
      fileUrl: fileUrl,
    });
    revalidatePath("/datasets");
    return { success: true, message: "Dataset added successfully!" };
  } catch (error: any) {
    return { error: error?.message };
  }
}

// export async function insertPapers(
//   values: z.infer<typeof papersSchema>,
//   datasetId: string,
// ) {
//   const validatedFields = papersSchema.safeParse(values);
//   if (!validatedFields.success) {
//     return { error: "Invalid Fields!" };
//   }
//   const { title, url } = validatedFields.data;
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });
//   const user_id = session?.user.id;
//   await db.insert(papers).values({ title, url, datasetId, userId: user_id });
// }

export async function getDatasets() {
  const datasets = await db.select().from(dataset);
  return datasets;
}
export async function getDatasetsForSearch(query: string) {
  const datasets = await db
    .select({
      id: dataset.id,
      title: dataset.title,
      year: dataset.year,
      pi_name: dataset.pi_name,

      division: dataset.division,
      description: dataset.description,
    })
    .from(dataset)
    .where(
      or(
        ilike(dataset.title, `%${query}%`),
        ilike(dataset.description, `%${query}%`),
        ilike(dataset.pi_name, `%${query}%`),
        ilike(dataset.division, `%${query}%`),
        ilike(dataset.year, `%${query}%`),
      ),
    );

  return datasets;
}

export async function getDatasetById(id: string) {
  const returnedDataset = await db
    .select()
    .from(dataset)
    .where(eq(dataset.id, id));
  return returnedDataset;
}

export async function deleteDataset(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user_id = session.user.id;

  try {
    await db.delete(dataset).where(eq(dataset.id, id));
    revalidatePath("/datasets");
    return { success: true, message: "Dataset deleted successfully!" };
  } catch (error: any) {
    return { error: error?.message };
  }
}
export async function updateDataset(
  id: string,
  data: z.infer<typeof datasetSchema>,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user_id = session.user.id;

  // Convert papers array to string
  const formattedData = {
    ...data,
    papers: JSON.stringify(data.papers),
  };

  try {
    await db.update(dataset).set(formattedData).where(eq(dataset.id, id));
    revalidatePath("/datasets");
    return { success: true, message: "Dataset updated successfully!" };
  } catch (error: any) {
    return { error: error?.message };
  }
}

export async function saveDataset(datasetId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user_id = session.user.id;

  try {
    await db.insert(saved_dataset).values({ datasetId, userId: user_id });
  } catch (error: any) {
    return { error: error?.message };
  }
}

export async function checkSavedDataset(datasetId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user_id = session.user.id;
  const savedDataset = await db
    .select()
    .from(saved_dataset)
    .where(
      and(
        eq(saved_dataset.datasetId, datasetId),
        eq(saved_dataset.userId, user_id),
      ),
    );

  if (savedDataset.length > 0) {
    return true;
  } else {
    return false;
  }
}
export async function getSavedDatasets() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user_id = session.user.id;

  const savedDatasets = await db
    .select({
      id: saved_dataset.id,
      userId: saved_dataset.userId,
      datasetId: saved_dataset.datasetId,
      title: dataset.title,
      status: access_request.status,
    })
    .from(saved_dataset)
    .leftJoin(dataset, eq(saved_dataset.datasetId, dataset.id))
    .leftJoin(
      access_request,
      and(
        eq(access_request.datasetId, saved_dataset.datasetId),
        eq(access_request.userId, saved_dataset.userId),
      ),
    )
    .where(eq(saved_dataset.userId, user_id));
  return savedDatasets;
}
{
}

export async function deleteSavedDataset(datasetId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user_id = session.user.id;

  try {
    await db
      .delete(saved_dataset)
      .where(
        and(
          eq(saved_dataset.datasetId, datasetId),
          eq(saved_dataset.userId, user_id),
        ),
      );
  } catch (error: any) {
    return { error: error?.message };
  }
}
