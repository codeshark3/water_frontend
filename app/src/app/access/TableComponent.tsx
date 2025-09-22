"use client";

import { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { AccessRequest, columns } from "./columns";
import { Input } from "~/components/ui/input";
import { matchSorter } from "match-sorter";

interface TableComponentProps {
  initialData: AccessRequest[];
}

const TableComponent = ({ initialData }: TableComponentProps) => {
  const [users, setUsers] = useState<AccessRequest[]>(initialData);
  const [globalFilter, setGlobalFilter] = useState("");

  // Apply fuzzy filtering when globalFilter changes
  useEffect(() => {
    if (!globalFilter) {
      setUsers(initialData);
      return;
    }

    const filteredData = matchSorter(initialData, globalFilter, {
      keys: [
        "id",
        "reason",
        "status",
        "user_name",
        "createdAt",

        // Add any other fields you want to search through
      ],
      threshold: matchSorter.rankings.CONTAINS,
    });

    setUsers(filteredData);
  }, [globalFilter, initialData]);

  return (
    <div className="space-y-4">
      {/* <div className="flex items-center justify-between">
        <Input
          placeholder="Search all columns..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      </div> */}
      <DataTable
        columns={columns}
        data={users}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
    </div>
  );
};

export default TableComponent;
