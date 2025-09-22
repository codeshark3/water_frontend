"use client";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SelectItem } from "../ui/select";
import CustomFormField from "~/components/CustomFormField";
import { Form } from "~/components/ui/form";
import { FormFieldType } from "~/components/CustomFormField";
import { toast } from "~/hooks/use-toast";
import { Button } from "~/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { datasetSchema } from "~/schemas";
import { years, divisions } from "~/constants";
import { authClient } from "~/lib/auth-client";
import { insertDataset } from "~/server/dataset_queries";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@uploadthing/react";
import { papersSchema } from "~/schemas";
import { useState } from "react";
import { useUploadThing } from "~/utils/uploadthing";
import { X } from "lucide-react";
const CreateDatasetForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { startUpload } = useUploadThing("datasetUploader");
  const form = useForm<z.infer<typeof datasetSchema>>({
    resolver: zodResolver(datasetSchema),
    defaultValues: {
      title: "",
      year: "",
      pi_name: "",
      description: "",
      division: "", // Default to some valid division ID
      fileUrl: "",
      papers: [] as { title: string; url: string }[],
      tags: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof datasetSchema>) => {
    if (!file) {
      toast({
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    const datasetId = uuidv4();

    startTransition(async () => {
      try {
        // Upload using UploadThing
        const uploadResult = await startUpload([file]);

        if (!uploadResult || !uploadResult[0]) {
          throw new Error("File upload failed");
        }

        const fileUrl = uploadResult[0].url;

        // Then, create the dataset with the file URL
        const result = await insertDataset({ values, fileUrl, datasetId });

        if (result.success) {
          toast({
            description: "Dataset created successfully",
            variant: "default",
            className: "bg-emerald-500 text-white font-bold",
          });
          router.push("/datasets");
        }
      } catch (error) {
        console.error(error);
        toast({
          description: "An error occurred",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.INPUT}
          name="title"
          label="Dataset Name"
          placeholder="Dataset Name"
        />

        <div className="flex gap-2">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            name="year"
            label="Year of Start"
            placeholder="Year of Start"
          >
            {years.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </CustomFormField>

          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.SELECT}
            name="division"
            label="Division"
            placeholder="Select Division"
          >
            {divisions.map((division) => (
              <SelectItem key={division} value={division}>
                {division}
              </SelectItem>
            ))}
          </CustomFormField>
        </div>

        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.INPUT}
          name="pi_name"
          label="Principal Investigator"
          placeholder="Name of Principal Investigator"
        />

        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.TEXTAREA}
          name="description"
          label="Description"
          placeholder="Description"
        />

        <div>
          {(form.watch("papers") || []).map((paper, index) => (
            <div key={index} className="mb-4 flex items-center gap-2">
              <div className="w-1/2">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  name={`papers.${index}.title`}
                  label="Paper Title"
                  placeholder="Paper Title"
                />
              </div>
              <div className="w-1/2">
                <CustomFormField
                  control={form.control}
                  fieldType={FormFieldType.INPUT}
                  name={`papers.${index}.url`}
                  label="Paper URL"
                  placeholder="Paper URL"
                />
              </div>
              {index >= 0 && (
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      const papers = form.getValues("papers") || [];
                      papers.splice(index, 1);
                      form.setValue("papers", papers);
                    }}
                    className="mt-4"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const papers = form.getValues("papers") || [];
              form.setValue("papers", [...papers, { title: "", url: "" }]);
            }}
          >
            Add Paper
          </Button>
        </div>
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.INPUT}
          name="tags"
          label="Tags"
          placeholder="Tags"
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Upload Dataset File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full"
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending || !file}>
          {isPending ? "Uploading..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default CreateDatasetForm;
