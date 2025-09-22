"use client";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
// removed dropdown in favor of inline icon actions
import Link from "next/link";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Users = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role?: string | null; // Make role optional and nullable
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: number | null;
  createdAt: string;
  updatedAt: string;
};
export const columns: ColumnDef<Users>[] = [
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
    accessorKey: "name",
    // header: "Start date",

    header: () => <div className="text-center">Gender</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">{row.getValue("name")}</div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">{row.getValue("role")}</div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">{row.getValue("email")}</div>
      );
    },
  },

  //   {
  //     accessorKey: "source",
  //     header: "Source",
  //     cell: ({ row }) => {
  //       return (
  //         <div className="text-center font-medium">{row.getValue("source")}</div>
  //       );
  //     },
  //   },
  //   {
  //     accessorKey: "location",
  //     header: "Location",
  //     cell: ({ row }) => {
  //       return (
  //         <div className="text-center font-medium">
  //           {row.getValue("location")}
  //         </div>
  //       );
  //     },
  //   },
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
            onClick={() => router.push(`/admin/users/${user.id}`)}
            aria-label="View details"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => router.push(`/admin/users/${user.id}`)}
            aria-label="Edit user"
            title="Edit user"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            onClick={() => console.log("Delete user", user.id)}
            aria-label="Delete user"
            title="Delete user"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
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
