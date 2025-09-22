import React from "react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { getAccessRequestById } from "~/server/access_request_queries";
import { Building, User, Calendar, Mail } from "lucide-react";
import AccessRequestActions from "./AccessRequestActions";
const page = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const { id } = params;
  const accessRequest = await getAccessRequestById(parseInt(id));

  if (!Array.isArray(accessRequest) || accessRequest.length === 0) {
    return <div>Access request not found or unauthorized</div>;
  }

  const request = accessRequest[0] as NonNullable<(typeof accessRequest)[0]>;
  return (
    <div className="mx-auto w-full px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">
          {request.dataset_title}
        </h1>
        <div className="mt-4 flex gap-2">
          <Link href="/access">
            <Button variant="outline">Back to Requests</Button>
          </Link>
          <AccessRequestActions requestId={request.access_request_id} />
        </div>
      </div>

      <div className="rounded-lg border p-6 shadow-sm">
        {/* Metadata Grid */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">
              Requested By:
            </span>
            <span className="text-sm text-primary">{request.user_name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Email:</span>
            <span className="text-sm text-primary">{request.user_email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">
              Year of Start:
            </span>
            <span className="text-sm text-primary">{request.dataset_year}</span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Status:</span>
            <span
              className={`rounded-md px-2 py-1 text-sm ${
                request.request_status === "approved"
                  ? "bg-emerald-500 text-white"
                  : request.request_status === "rejected"
                    ? "bg-red-500 text-white"
                    : "bg-gray-500 text-white"
              }`}
            >
              {request.request_status}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">
              Principal Investigator:
            </span>
            <span className="text-sm text-primary">{request.dataset_pi}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Division:</span>
            <span className="text-sm text-primary">
              {request.dataset_division}
            </span>
          </div>
        </div>

        {/* Description Section */}
        <div className="mb-6">
          <h2 className="text-p mb-2 text-lg font-semibold">
            Reason for request
          </h2>
          <p className="whitespace-pre-wrap text-gray-700">{request.reason}</p>
        </div>

        {/* Metadata Footer */}
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Created: {request.createdAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
