import { createUploadthing, type FileRouter } from "uploadthing/next";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "~/app/api/uploadthing/core";

const f = createUploadthing();

export const ourFileRouter = {
    datasetUploader: f({ pdf: { maxFileSize: "32MB" } })
        .middleware(async () => {
            // Optional: Check auth here
            return {};
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata);
            console.log("file url", file.url);
        }),
} satisfies FileRouter;

export const { useUploadThing } = generateReactHelpers<OurFileRouter>();