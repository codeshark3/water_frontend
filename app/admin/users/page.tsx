import React from "react";
import TableComponent from "~/app/admin/TableComponent";
import { getUsers } from "~/server/queries";
const page = () => {
  return (
    <div>
     
      <TableComponent  />
    </div>
  );
};

export default page;


