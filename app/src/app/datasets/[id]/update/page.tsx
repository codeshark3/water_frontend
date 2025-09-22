"use client";

import { useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "~/hooks/use-toast";
import { datasetSchema } from "~/schemas/index";
import { updateDataset, getDatasetById } from "~/server/dataset_queries";
import { Form } from "~/components/ui/form";
import { FormFieldType } from "~/components/CustomFormField";
import CustomFormField from "~/components/CustomFormField";
import { Button } from "~/components/ui/button";
import * as z from "zod";
import { SelectItem } from "~/components/ui/select";
import { years, divisions } from "~/constants";

const UpdateDatasetForm = () => {
  const { id } = useParams() as { id: string };
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Remove the dataset state since we don't need it
  const form = useForm<z.infer<typeof datasetSchema>>({
    resolver: zodResolver(datasetSchema),
    defaultValues: async () => {
      const data = await getDatasetById(Number(id));
      if (!data?.[0]) {
        throw new Error("Dataset not found");
      }
      const dataset = data[0];
      return {
        title: dataset.title,
        year: dataset.year,
        pi_name: dataset.pi_name,
        description: dataset.description,
        division: dataset.division,
        papers: dataset.papers ?? "",
        tags: dataset.tags ?? "",
      };
    },
  });

  const onSubmit = (values: z.infer<typeof datasetSchema>) => {
    startTransition(() => {
      updateDataset(Number(id), values)
        .then((data) => {
          if (data.success) {
            toast({
              description: "Dataset updated successfully",
              variant: "default",
              className: "bg-emerald-500 text-white font-bold",
            });
            router.push(`/datasets/${id}`);
          } else {
            toast({
              description: "An error occurred while updating the dataset",
              variant: "destructive",
            });
          }
        })
        .catch((err) => {
          console.error(err);
          toast({
            description: "An unexpected error occurred",
            variant: "destructive",
          });
        });
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
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.SELECT}
          name="year"
          label="Year of Start"
          placeholder="Year of Start"
        >
          {years.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </CustomFormField>
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.INPUT}
          name="pi_name"
          label="Principal Investigator"
          placeholder="Name of Principal Investigator"
        />
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
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.TEXTAREA}
          name="description"
          label="Description"
          placeholder="Dataset Description"
        />
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.TEXTAREA}
          name="papers"
          label="Papers"
          placeholder="Related Papers"
        />
        <CustomFormField
          control={form.control}
          fieldType={FormFieldType.INPUT}
          name="tags"
          label="Tags"
          placeholder="Dataset Tags"
        />
        <Button
          type="submit"
          className="w-full bg-primary"
          disabled={isPending}
        >
          Update Dataset
        </Button>
      </form>
    </Form>
  );
};

export default UpdateDatasetForm;
