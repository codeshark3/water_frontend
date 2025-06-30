// import "server-only";
"use server";
import { db } from "./db";

import { tests } from "./db/schema";
import { and, eq, desc, sql } from "drizzle-orm";
import { SignInSchema,  } from "~/schemas/index";
import type * as z from "zod";
import { headers } from "next/headers";
import { promises as fs } from 'fs';
import path from 'path';
import { auth } from "~/lib/auth";
// import { validateRequest } from "~/auth";


export async function insertTest(test: typeof tests.$inferInsert) {
    const newTest = await db.insert(tests).values(test)
    return newTest;
}

export async function getTests() {
    const test =  await db.select().from(tests)

    if (!test) return null;
    return test;
}

export async function getTestById(id: string) {
    const test = await db.select().from(tests).where(eq(tests.id, id))
    return test;  
}

export async function getTestByUserId(userId: string) {
    const test = await db.select().from(tests).where(eq(tests.userId, userId))
    return test;
}

export async function getTopLocationByCount() {
    const topLocation = await db.select({
        location: tests.location,
        count: sql<number>`count(*)`
    })
    .from(tests)
    .groupBy(tests.location)
    .orderBy(desc(sql<number>`count(*)`));
    
    return topLocation;
}



export async function insertFromCSV(filePath: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session?.user?.id;
    try {
        // Read the CSV file
        const csvData = await fs.readFile(filePath, 'utf-8');
        
        const lines = csvData.trim().split("\n");
        if (lines.length === 0) {
            throw new Error('CSV file is empty');
        }

        const firstLine = lines[0];
        if (!firstLine) {
            throw new Error('CSV file has no headers');
        }

        const headers = firstLine.split(",").map(h => h.trim());
        console.log('CSV headers:', headers);
    
        const rows = lines.slice(1).map((line) => {
            const values = line.split(",").map(v => v.trim());
            if (values.length !== headers.length) {
                throw new Error(`Invalid CSV row: ${line}`);
            }
            const row: Record<string, string> = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            return row;
        });
    
        // Convert to match our schema with column mapping
        const formattedRows = rows.map((row, index) => {
            // Parse date field
            let parsedDate: Date | null = null;
            if (row.date) {
                try {
                    // Try multiple date formats
                    const dateStr = row.date.trim();
                    if (dateStr) {
                        // Try ISO format first (YYYY-MM-DD)
                        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                            parsedDate = new Date(dateStr);
                        }
                        // Try DD/MM/YYYY format
                        else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
                            const parts = dateStr.split('/');
                            if (parts.length === 3) {
                                const [day, month, year] = parts as [string, string, string];
                                parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                            }
                        }
                        // Try MM/DD/YYYY format
                        else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
                            const parts = dateStr.split('/');
                            if (parts.length === 3) {
                                const [month, day, year] = parts as [string, string, string];
                                parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                            }
                        }
                        // Try DD-MM-YYYY format
                        else if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
                            const parts = dateStr.split('-');
                            if (parts.length === 3) {
                                const [day, month, year] = parts as [string, string, string];
                                parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                            }
                        }
                        // Try MM-DD-YYYY format
                        else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
                            const parts = dateStr.split('-');
                            if (parts.length === 3) {
                                const [month, day, year] = parts as [string, string, string];
                                parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                            }
                        }
                        // Try any other format that JavaScript can parse
                        else {
                            parsedDate = new Date(dateStr);
                        }
                        
                        // Validate the parsed date
                        if (!parsedDate || isNaN(parsedDate.getTime())) {
                            console.warn(`Row ${index + 1}: Invalid date format '${dateStr}', using current date`);
                            parsedDate = new Date();
                        }
                    }
                } catch (error) {
                    console.warn(`Row ${index + 1}: Error parsing date '${row.date}', using current date`);
                    parsedDate = new Date();
                }
            }
          
            return {
                id: row.id || crypto.randomUUID(), // Generate UUID if not provided
                name: row.name || null,
                gender: row.gender || null,
                age: row.age ? parseInt(row.age, 10) : null,
                location: row.location || null,
                date: parsedDate || null, // Use parsed date or null
                userId: "Lwt9Yg4HCGUF6DNdcsBjT", // Use default if not provided
                oncho: row.oncho || null,
                schistosomiasis: row.schistosomiasis || row.schisto || null, // Handle both column names
                lf: row.lf || null,
                helminths: row.helminths || null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        });
    
        // Validate that required fields are present
        formattedRows.forEach((row, index) => {
            if (!row.userId) {
                throw new Error(`Row ${index + 1}: userId is required`);
            }
        });

        console.log(`Processing ${formattedRows.length} rows...`);
        await db.insert(tests).values(formattedRows);
        return { success: true, message: `Imported ${formattedRows.length} rows successfully` };
    } catch (error) {
        console.error('Error importing CSV:', error);
        throw new Error(`Failed to import CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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