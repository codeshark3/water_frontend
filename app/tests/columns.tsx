"use client";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";

import { ArrowUpDown } from "lucide-react";
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



export const columns: ColumnDef<Test>[] = [
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
          {name.length > 50 ? `${name.slice(0, 50)}...` : name}
        </div>
      );
    },
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">{row.getValue("gender")}</div>
      );
    },
  },

  {
    accessorKey: "age",
    header: "Age",
    cell: ({ row }) => {
      const age = (row.getValue("age") as number) || "";
     
      return (
        <div className="text-center font-medium">{age}</div>
      );
    },
  },

  // {
  //   accessorKey: "status",
  //   header: "Status",
  //   cell: ({ row }) => {
  //     const status = row.getValue("status") as string | null;
  //     return (
  //       <span
  //         className={`rounded-md px-2 py-1 text-center text-sm font-medium ${
  //           status === "approved"
  //             ? "bg-emerald-500 text-white"
  //             : status === "rejected"
  //               ? "bg-red-500 text-white"
  //               : "bg-gray-500 text-white"
  //         }`}
  //       >
  //         {status ?? "not requested"}
  //         {/* {status === "not requested" && (
  //           <RequestAccessModal
  //             datasetId={row.getValue("id")}
  //             datasetTitle={row.getValue("title")}
  //           />
  //         )} */}
  //       </span>
  //     );
  //   },
  // },
];