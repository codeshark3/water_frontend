"use client";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Plus, Edit, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type AccessRequest = {
  user_name: string;
  id: number;
  reason: string;
  status: string;
  createdAt: string;
};

export const columns: ColumnDef<AccessRequest>[] = [
  // {
  //   accessorKey: "sample_id",
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         className="text-center"
  //         variant="ghost"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //       >
  //       Sample ID
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </Button>
  //     );
  //   },
  //   cell: ({ row }) => {
  //     return (
  //       <div className="text-center font-medium">{row.getValue("name")}</div>
  //     );
  //   },
  // },
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Id
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "reason",
    // header: "Start date",

    header: () => <div className="text-center">Reason</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">{row.getValue("reason")}</div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <span
          className={`rounded-md px-2 py-1 text-center text-sm font-medium ${
            row.getValue("status") === "approved"
              ? "bg-emerald-500 text-white"
              : row.getValue("status") === "rejected"
                ? "bg-red-500 text-white"
                : "bg-gray-500 text-white"
          }`}
        >
          {row.getValue("status")}
        </span>
      );
    },
  },
  {
    accessorKey: "user_name",
    header: "User Name",
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.getValue("user_name")}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.getValue("createdAt")}
        </div>
      );
    },
  },
  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //     const user = row.original as Users;
  //     const router = useRouter();
  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreHorizontal className="h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //           <DropdownMenuItem
  //             onClick={() => router.push(`/admin/users/${user.id}`)}
  //           >
  //             Details
  //             {/* <Link href={`/admin/users/${user.id}`}>Details</Link> */}
  //           </DropdownMenuItem>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem
  //             onClick={() => router.push(`/admin/users/${user.id}`)}
  //           >
  //             View Customer
  //           </DropdownMenuItem>
  //           <DropdownMenuItem
  //             onClick={() => console.log("View payment details")}
  //           >
  //             View Payment Details
  //           </DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  // },
  // {
  //   header: "Actions",
  //   id: "gactions",
  //   cell: ({ row }) => {
  //     const sample = row.original;

  //     return (
  //       <>
  //         <div className="flex items-center justify-center">
  //           <Button className="h-10 w-20 bg-sky-600">
  //             <Edit size={16} color="white" />
  //             {/* <Link
  //             href={`/samples/${sample.id} `}

  //           >
  //             Details
  //           </Link> */}
  //           </Button>
  //         </div>

  //         <div className="flex items-center space-x-2">
  //           <Button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600">
  //             <Plus size={26} color="white" />
  //           </Button>
  //           <Button className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600">
  //             <Edit size={26} color="white" />
  //           </Button>
  //         </div>
  //         <DropdownMenu>
  //           <DropdownMenuTrigger asChild>
  //             <Button variant="ghost" className="h-8 w-8 p-0">
  //               <span className="sr-only">Open menu</span>
  //               <MoreHorizontal className="h-4 w-4" />
  //             </Button>
  //           </DropdownMenuTrigger>
  //           <DropdownMenuContent align="end">
  //             <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //             <DropdownMenuItem
  //               onClick={() =>
  //                 navigator.clipboard.writeText(project.project_id)
  //               }
  //             >
  //               Copy Project ID
  //             </DropdownMenuItem>
  //             <DropdownMenuSeparator />
  //             <DropdownMenuItem>View customer</DropdownMenuItem>
  //             <DropdownMenuItem>View payment details</DropdownMenuItem>
  //           </DropdownMenuContent>
  //         </DropdownMenu>
  //       </>
  //     );
  //   },
  // },
];
