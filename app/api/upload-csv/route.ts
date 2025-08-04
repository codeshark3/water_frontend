import { NextResponse } from 'next/server';
import { insertFromCSV } from '~/server/test_queries';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { headers } from 'next/headers';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Create a temporary file
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, `upload-${Date.now()}.csv`);
        
        // Convert File to Buffer and write to temp file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await fs.writeFile(tempFilePath, buffer);

        // Process the CSV file with authentication
        const result = await insertFromCSV(tempFilePath);

        // Clean up the temporary file
        await fs.unlink(tempFilePath);

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error processing CSV:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to process CSV file' },
            { status: 500 }
        );
    }
} 