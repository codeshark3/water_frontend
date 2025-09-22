"use client";

import { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { Users, createUserColumns } from "./columns";
import { matchSorter } from "match-sorter";
import UserDetailsDialog from "~/components/UserDetailsDialog";
import EditUserDialog from "~/components/EditUserDialog";
import DeleteUserDialog from "~/components/DeleteUserDialog";
import CreateUserDialog from "~/components/CreateUserDialog";
import { Button } from "~/components/ui/button";

interface TableComponentProps {
  initialData: Users[];
}

const TableComponent = ({ initialData }: TableComponentProps) => {
  const [users, setUsers] = useState<Users[]>(initialData);
  const [globalFilter, setGlobalFilter] = useState("");
  
  // Dialog states (mirror tests implementation)
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Apply fuzzy filtering when globalFilter changes
  useEffect(() => {
    if (!globalFilter) {
      setUsers(initialData);
      return;
    }

    const filteredData = matchSorter(initialData, globalFilter, {
      keys: [
        "id",
        "name",
        "email",
        "role"
      

        // Add any other fields you want to search through
      ],
      threshold: matchSorter.rankings.CONTAINS,
    });

    setUsers(filteredData);
  }, [globalFilter, initialData]);

  // Handlers (mirror tests implementation)
  const handleEdit = (user: Users) => {
    setSelectedUser(user);
    setIsUpdateDialogOpen(true);
  };

  const handleDelete = (user: Users) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleView = (user: Users) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleUpdateSuccess = () => {
    // For now, rely on a reload or parent refresh strategy
    // Keeps parity with tests modal flow
    window.location.reload();
  };

  const handleDeleteSuccess = () => {
    setUsers(prev => prev.filter(u => u.id !== selectedUser?.id));
    setSelectedUser(null);
  };

  const columns = createUserColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onView: handleView,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => setIsCreateDialogOpen(true)}>Add User</Button>
      </div>
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

      {/* Update Dialog */}
      <EditUserDialog
        user={selectedUser as any}
        isOpen={isUpdateDialogOpen}
        onClose={() => {
          setIsUpdateDialogOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={handleUpdateSuccess}
      />

      {/* Delete Dialog */}
      <DeleteUserDialog
        user={selectedUser as any}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={handleDeleteSuccess}
      />

      {/* View Dialog */}
      <UserDetailsDialog
        user={selectedUser as any}
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedUser(null);
        }}
      />

      {/* Create Dialog */}
      <CreateUserDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </div>
  );
};

export default TableComponent;
