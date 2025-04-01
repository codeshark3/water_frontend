"use client";

import { useEffect, useState } from "react";
import { DataTable } from "~/app/tests/data-table";
import { Test, columns } from "~/app/tests/columns";
import { testSchema } from "~/schemas";
import { matchSorter } from "match-sorter";
import { z } from "zod";

// Uncomment and use this interface
interface TableComponentProps {
  initialData: Test[];
}

const TableComponent = ({ initialData }: TableComponentProps) => {
  const [data, setData] = useState<Test[]>(initialData);
  const [globalFilter, setGlobalFilter] = useState("");

  // Apply fuzzy filtering when globalFilter changes
  useEffect(() => {
    if (!globalFilter) {
      setData(initialData);
      return;
    }

    const filteredData = matchSorter(initialData, globalFilter, {
      keys: [
        "id",

        "name",
        "gender",
        "age",
        "location",
      

        // Add any other fields you want to search through
      ],
      threshold: matchSorter.rankings.CONTAINS,
    });

    setData(filteredData);
  }, [globalFilter, initialData]);

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
    </div>
  );
};

export default TableComponent;