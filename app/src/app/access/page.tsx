import React from "react";
import TableComponent from "./TableComponent";
import { getAllAccessRequests } from "~/server/access_request_queries";

const Page = async () => {
  const accessRequests = await getAllAccessRequests();
  if ("error" in accessRequests) {
    return <div>Error loading access requests</div>;
  }

  // Format dates if needed
  const formattedData = accessRequests.map((request) => ({
    ...request,
    // createdAt: request.createdAt.toISOString(),
  }));

  return (
    <div className="container mx-auto py-10">
      <TableComponent initialData={formattedData} />
    </div>
  );
};

export default Page;
