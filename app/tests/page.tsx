import Link from "next/link";
import React from "react";
import { getTests} from "~/server/test_queries";

import { Plus, Search } from "lucide-react";

import TableComponent from "./TableComponent";
import { Test } from "./columns";

const TestsPage = async () => {
  const data = await getTests();

  const formattedData = data.map((test) => ({
    ...test,
    createdAt: test.createdAt?.toISOString(),
    updatedAt: test.updatedAt?.toISOString(),
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

        <TableComponent initialData={formattedData as Test[]} />
      </div>
    </div>
  );
};

export default TestsPage;