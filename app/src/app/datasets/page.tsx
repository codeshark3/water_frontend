import Link from "next/link";
import React from "react";
import { getDatasets } from "~/server/dataset_queries";

import { Plus, Search } from "lucide-react";

import TableComponent from "./TableComponent";

const DatasetsPage = async () => {
  const data = await getDatasets();

  const formattedData = data.map((dataset) => ({
    ...dataset,
    createdAt: dataset.createdAt.toISOString(),
    updatedAt: dataset.updatedAt.toISOString(),
  }));

  return (
    <div>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Datasets</h1>
          {/* <Link
            href="/datasets/create"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create New Dataset
          </Link> */}
        </div>

        <TableComponent initialData={formattedData} />
      </div>
    </div>
  );
};

export default DatasetsPage;
