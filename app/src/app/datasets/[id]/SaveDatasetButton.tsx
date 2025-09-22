"use client";
import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { LucideSave } from "lucide-react";
import { saveDataset, checkSavedDataset } from "~/server/dataset_queries";
import { useToast } from "~/hooks/use-toast";
const SaveDatasetButton = ({
  datasetId,
  disabled,
}: {
  datasetId: string;
  disabled: boolean;
}) => {
  const { toast } = useToast();

  const [isSaved, setIsSaved] = useState(false);
  useEffect(() => {
    const checkSaved = async () => {
      const result = await checkSavedDataset(datasetId);
      setIsSaved(result);
    };
    checkSaved();
  }, [datasetId]);

  const handleSaveDataset = async (datasetId: string) => {
    const result = await saveDataset(datasetId);

    if (result?.error) {
      toast({
        title: "Dataset failed to save",
        description: result.error,
        variant: "default",
        className: "bg-red-500 text-white font-bold ",
      });
    } else {
      toast({
        title: "Dataset saved",
        description: "Dataset saved successfully",
        variant: "default",
        className: "bg-green-500 text-white font-bold ",
      });
    }
  };
  return (
    <Button
      variant="secondary"
      onClick={() => handleSaveDataset(datasetId)}
      disabled={isSaved || disabled}
    >
      <LucideSave className="mr-2 h-4 w-4" />
      Save Dataset
    </Button>
  );
};

export default SaveDatasetButton;
