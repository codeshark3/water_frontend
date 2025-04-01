import Link from "next/link";
import React from "react";
import { getTestById } from "~/server/test_queries";
import { Button } from "~/components/ui/button";
import {
  Calendar,
  User,
  Tag,
  FileText,
  Building2,
  Download,
} from "lucide-react";

import { headers } from "next/headers";
import { auth } from "~/lib/auth";

const DatasetDetailsPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const { id } = await props.params;
  const tests = await getTestById(id);
  const test = tests[0]; // Get first test since getTestById returns an array

  if (!test) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Test not found
          </h2>
          <p className="mt-2 text-gray-600">
            The test you're looking for doesn't exist.
          </p>
          <Link href="/tests">
            <Button className="mt-4">Return to Tests</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full px-4 py-8">
      <div className="mb-6 flex-col items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">{test.name}</h1>
        <div className="mt-1 space-x-3">
          <Link href="/tests">
            <Button variant="outline">Back to Tests</Button>
          </Link>
          <Link href={`/tests/${id}/update`}>
            <Button>Edit Test</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-lg border p-6 shadow-sm">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Name:</span>
            <span className="text-sm text-primary">{test.name}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Tag className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Gender:</span>
            <span className="text-sm text-primary">{test.gender}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Age:</span>
            <span className="text-sm text-primary">{test.age}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Location:</span>
            <span className="text-sm text-primary">{test.location}</span>
          </div>

          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Onchocerciasis:</span>
            <span className="text-sm text-primary">{test.oncho}</span>
          </div>

          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Schistosomiasis:</span>
            <span className="text-sm text-primary">{test.schistosomiasis}</span>
          </div>

          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Lymphatic Filariasis:</span>
            <span className="text-sm text-primary">{test.lf}</span>
          </div>

          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Helminths:</span>
            <span className="text-sm text-primary">{test.helminths}</span>
          </div>
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>
              Created: {test.createdAt && new Date(test.createdAt).toLocaleDateString()}
            </span>
            <span>
              Last updated: {test.updatedAt && new Date(test.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetDetailsPage;