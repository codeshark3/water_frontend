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

export async function getTest(id: string) {
    const test = await db.query.tests.findFirst({
        where: eq(tests.id, id)
    });
    return test;
}