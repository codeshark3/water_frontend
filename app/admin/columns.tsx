"use client";

import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";

export type Users = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type UserColumnActions = {
  onView?: (user: Users) => void;
  onEdit?: (user: Users) => void;
  onDelete?: (user: Users) => void;
};

export const createUserColumns = (actions: UserColumnActions = {}): ColumnDef<Users>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Id
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "name",
    header: () => <div className="text-center">Name</div>,
    cell: ({ row }) => (
      <div className="text-center font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <div className="text-center font-medium">{row.getValue("role")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email", 
    cell: ({ row }) => (
      <div className="text-center font-medium">{row.getValue("email")}</div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const user = row.original as Users;
      const router = useRouter();
      return (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => actions.onView?.(user)}
            aria-label="View details"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => actions.onEdit?.(user)}
            aria-label="Edit user"
            title="Edit user"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            onClick={() => actions.onDelete?.(user)}
            aria-label="Delete user"
            title="Delete user"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

// Keep a default export for simple tables without actions
export const columns: ColumnDef<Users>[] = createUserColumns();


