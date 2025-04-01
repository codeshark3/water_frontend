// import "server-only";
"use server";
import { db } from "./db";

import {   tests } from "./db/schema";
import { and, eq } from "drizzle-orm";
import { SignInSchema,  } from "~/schemas/index";
import type * as z from "zod";
import { headers } from "next/headers";
// import { validateRequest } from "~/auth";


export async function getTests() {
    const test =  await db.select().from(tests)
    return test;
}

export async function getTestById(id: string) {
    const test = await db.select().from(tests).where(eq(tests.id, id))
    return test;  
}

// export async function updateTestResult(id: string, result: number) {
//     const updatedTest = await db
//         .update(tests)
//         .set({ 
//             result: result,
//             processed_at: new Date()
//         })
//         .where(eq(tests.id, id))
//         .returning();
    
//     return updatedTest[0];
// }