// import "server-only";
"use server";
import { db } from "./db";

import { tests, forecasts } from "./db/schema";
import { and, eq, desc, sql } from "drizzle-orm";
import { SignInSchema,  } from "~/schemas/index";
import type * as z from "zod";
import { headers } from "next/headers";

import path from 'path';
import { auth } from "~/lib/auth";
// import { validateRequest } from "~/auth";


export async function insertTest(test: typeof tests.$inferInsert) {
    const newTest = await db.insert(tests).values(test)
    return newTest;
}

export async function getTests() {
    const test = await db.select({
        id: tests.id,
        name: tests.name,
        gender: tests.gender,
        age: tests.age,
        location: tests.location,
        date: tests.date,
        userId: tests.userId,
        oncho: tests.oncho,
        schistosomiasis: tests.schistosomiasis,
        lf: tests.lf,
        helminths: tests.helminths,
        createdAt: tests.createdAt,
        updatedAt: tests.updatedAt
    }).from(tests);

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



export async function insertFromCSVString(csvData: string, userId: string) {
    try {
        const lines = csvData.trim().split("\n");
        if (lines.length === 0) {
            throw new Error('CSV data is empty');
        }

        const firstLine = lines[0];
        if (!firstLine) {
            throw new Error('CSV data has no headers');
        }

        const headers = firstLine.split(",").map(h => h.trim());
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
                userId: userId, // Use userId from parameter
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

export async function saveForecastData(forecastData: Array<{
    diseaseType: string;
    month: string;
    isForecast: boolean;
    totalTests?: number;
    positiveCases?: number;
    infectionRate?: number;
    forecastedInfectionRate?: number;
    forecastedPositiveCases?: number;
}>) {
    try {
        const formattedData = forecastData.map(data => ({
            id: crypto.randomUUID(),
            diseaseType: data.diseaseType,
            month: data.month,
            isForecast: data.isForecast,
            totalTests: data.totalTests || null,
            positiveCases: data.positiveCases || null,
            infectionRate: data.infectionRate || null,
            forecastedInfectionRate: data.forecastedInfectionRate || null,
            forecastedPositiveCases: data.forecastedPositiveCases || null,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        await db.insert(forecasts).values(formattedData);
        return { success: true, message: `Saved ${formattedData.length} forecast records` };
    } catch (error) {
        console.error('Error saving forecast data:', error);
        throw new Error(`Failed to save forecast data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getForecastData(diseaseType: string, months: number = 18) {
    try {
        // Get data for the specified disease type, including both historical and forecast
        const data = await db.select()
            .from(forecasts)
            .where(eq(forecasts.diseaseType, diseaseType))
            .orderBy(forecasts.month);

        if (!data || data.length === 0) {
            return null;
        }

        // Filter to last N months if specified
        if (months > 0) {
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - months);
            const cutoffMonth = cutoffDate.toISOString().slice(0, 7); // YYYY-MM format
            
            return data.filter(item => item.month >= cutoffMonth);
        }

        return data;
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        throw new Error(`Failed to fetch forecast data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function clearOldForecasts(diseaseType: string, keepMonths: number = 6) {
    try {
        // Calculate cutoff date for old forecasts
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - keepMonths);
        const cutoffMonth = cutoffDate.toISOString().slice(0, 7); // YYYY-MM format

        // Delete old forecast data (not historical data)
        const result = await db.delete(forecasts)
            .where(
                and(
                    eq(forecasts.diseaseType, diseaseType),
                    eq(forecasts.isForecast, true),
                    sql`${forecasts.month} < ${cutoffMonth}`
                )
            );

        return { success: true, message: 'Old forecasts cleared' };
    } catch (error) {
        console.error('Error clearing old forecasts:', error);
        throw new Error(`Failed to clear old forecasts: ${error instanceof Error ? error.message : 'Unknown error'}`);
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