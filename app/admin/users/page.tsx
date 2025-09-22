import React from "react";
import TableComponent from "~/app/admin/TableComponent";
import { getUsers } from "~/server/queries";

const Page = async () => {
  const users = (await getUsers()).map((u: any) => ({
    ...u,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
    updatedAt: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : u.updatedAt,
  }));
  return (
    <div>
      <TableComponent initialData={users} />
    </div>
  );
};

export default Page;


