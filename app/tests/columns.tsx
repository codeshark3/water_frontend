"use client";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";

import { ArrowUpDown, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Test = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  gender: string;
  age: number;
  location: string;
  userId: string;
  oncho: string;
  schistosomiasis: string;
  lf: string;
  helminths: string;
};



interface ColumnsProps {
  onEdit?: (test: Test) => void;
  onDelete?: (test: Test) => void;
  onView?: (test: Test) => void;
}

export const createColumns = ({ onEdit, onDelete, onView }: ColumnsProps): ColumnDef<Test>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return (
        <div className="font-medium">
          {name}
          {/* {name && name.length > 50 ? `${name.slice(0, 50)}...` : name || '-'} */}
        </div>
      );
    },
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => {
      return (
        <div className="  font-medium">{row.getValue("gender")}</div>
      );
    },
  },

  {
    accessorKey: "age",
    header: "Age",
    cell: ({ row }) => {
      const age = (row.getValue("age") as number) || "";
     
      return (
        <div className="  font-medium">{age}</div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      return (
        <div className="  font-medium">{row.getValue("location")}</div>
      );
    },
  },
  {
    accessorKey: "oncho",
    header: "Onchocerciasis",
    cell: ({ row }) => {
      const result = row.getValue("oncho") as string;
      return (
        <span
          className={`rounded-md px-2 py-1 text-sm font-medium ${
            result === "positive"
              ? "bg-red-100 text-red-800"
              : result === "negative"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {result || "N/A"}
        </span>
      );
    },
  },
  {
    accessorKey: "schistosomiasis",
    header: "Schistosomiasis",
    cell: ({ row }) => {
      const result = row.getValue("schistosomiasis") as string;
      return (
        <span
          className={`rounded-md px-2 py-1 text-sm font-medium ${
            result === "positive"
              ? "bg-red-100 text-red-800"
              : result === "negative"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {result || "N/A"}
        </span>
      );
    },
  },
  {
    accessorKey: "lf",
    header: "Lymphatic Filariasis",
    cell: ({ row }) => {
      const result = row.getValue("lf") as string;
      return (
        <span
          className={`rounded-md px-2 py-1 text-sm font-medium ${
            result === "positive"
              ? "bg-red-100 text-red-800"
              : result === "negative"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {result || "N/A"}
        </span>
      );
    },
  },
  {
    accessorKey: "helminths",
    header: "Soil-transmitted Helminths",
    cell: ({ row }) => {
      const result = row.getValue("helminths") as string;
      return (
        <span
          className={`rounded-md px-2 py-1 text-sm font-medium ${
            result === "positive"
              ? "bg-red-100 text-red-800"
              : result === "negative"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {result || "N/A"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const test = row.original;
      return (
        <div className="flex items-center gap-2">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(test)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(test)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(test)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];

// Backward compatibility - export default columns without actions
export const columns: ColumnDef<Test>[] = createColumns({});