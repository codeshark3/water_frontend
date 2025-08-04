'use client';

import { Upload } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

export default function CSVUploadButton() {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check if it's a CSV file
        if (!file.name.endsWith('.csv')) {
            toast.error("Please upload a CSV file");
            return;
        }

        try {
            setIsUploading(true);
            
            // Create FormData
            const formData = new FormData();
            formData.append('file', file);

            // Upload the file
            const response = await fetch('/api/upload-csv', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            
            toast.success(data.message || "CSV file uploaded successfully");

            // Optionally refresh the page or update the table
            window.location.reload();

        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to upload CSV file");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative">
            <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
            />
            <Button 
                variant="outline"
                className="flex items-center gap-2"
                disabled={isUploading}
            >
                <Upload className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload CSV"}
            </Button>
        </div>
    );
} 