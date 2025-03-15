"use client";

import { useState } from "react";
import { toast } from "~/hooks/use-toast";
import { deleteDataset } from "~/server/dataset_queries";
import { Button } from "~/components/ui/button";

interface DatasetDeleteButtonProps {
  datasetId: number;
  //  onDelete: (id: number) => void;
}

const DatasetDeleteButton: React.FC<DatasetDeleteButtonProps> = ({
  datasetId,
  //onDelete,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteDataset(datasetId);
    if (result.success) {
      toast({
        description: "Dataset deleted successfully",
        variant: "default",
        className: "bg-emerald-500 text-white font-bold",
      });
      //  onDelete(datasetId); // Call parent function to update UI
    } else {
      toast({
        description: "An error occurred while deleting the dataset",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <Button
      className="bg-red-500 hover:bg-red-700"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? "Deleting..." : "Delete"}
    </Button>
  );
};

export default DatasetDeleteButton;
