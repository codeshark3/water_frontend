"use client";

import { useEffect, useState } from "react";
import { DataTable } from "~/app/tests/data-table";
import { Test, createColumns } from "~/app/tests/columns";
import { testSchema } from "~/schemas";
import { matchSorter } from "match-sorter";
import { z } from "zod";
import UpdateTestForm from "~/components/forms/UpdateTestForm";
import DeleteTestDialog from "~/components/DeleteTestDialog";
import TestDetailsDialog from "~/components/TestDetailsDialog";

// Uncomment and use this interface
interface TableComponentProps {
  initialData: Test[];
}

const TableComponent = ({ initialData }: TableComponentProps) => {
  const [data, setData] = useState<Test[]>(initialData);
  const [globalFilter, setGlobalFilter] = useState("");
  
  // Dialog states
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

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
        "oncho",
        "schistosomiasis",
        "lf",
        "helminths",
      ],
      threshold: matchSorter.rankings.CONTAINS,
    });

    setData(filteredData);
  }, [globalFilter, initialData]);

  const handleEdit = (test: Test) => {
    setSelectedTest(test);
    setIsUpdateDialogOpen(true);
  };

  const handleDelete = (test: Test) => {
    setSelectedTest(test);
    setIsDeleteDialogOpen(true);
  };

  const handleView = (test: Test) => {
    setSelectedTest(test);
    setIsViewDialogOpen(true);
  };

  const handleUpdateSuccess = () => {
    // Refresh data by updating the local state
    // In a real app, you might want to refetch from the server
    window.location.reload();
  };

  const handleDeleteSuccess = () => {
    // Remove the deleted test from local state
    setData(prevData => prevData.filter(test => test.id !== selectedTest?.id));
    setSelectedTest(null);
  };

  const columns = createColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onView: handleView,
  });

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />

      {/* Update Dialog */}
      <UpdateTestForm
        testId={selectedTest?.id || ""}
        isOpen={isUpdateDialogOpen}
        onClose={() => {
          setIsUpdateDialogOpen(false);
          setSelectedTest(null);
        }}
        onSuccess={handleUpdateSuccess}
      />

      {/* Delete Dialog */}
      <DeleteTestDialog
        test={selectedTest}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedTest(null);
        }}
        onSuccess={handleDeleteSuccess}
      />

      {/* View Dialog */}
      <TestDetailsDialog
        test={selectedTest}
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedTest(null);
        }}
      />
    </div>
  );
};

export default TableComponent;