import React from "react";
import { getDatasetById } from "~/server/dataset_queries";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import {
  Calendar,
  User,
  Tag,
  FileText,
  Building2,
  Download,
} from "lucide-react";
import RedirectToAuthButton from "./RedirectToAuthButton";

const page = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;
  const dataset = await getDatasetById(id);

  if (!dataset || dataset.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Dataset not found
          </h2>
          <p className="mt-2 text-gray-600">
            The dataset you're looking for doesn't exist.
          </p>
          <Link href="/datasets">
            <Button className="mt-4">Return to Datasets</Button>
          </Link>
        </div>
      </div>
    );
  }

  const data = dataset[0] as NonNullable<(typeof dataset)[0]>;

  return (
    <div className="mx-auto w-[90%] px-4 py-8">
      <div className="rounded-lg border p-6 shadow-sm">
        {/* Metadata Grid */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">
              Dataset Name:
            </span>
            <span className="text-md text-primary">{data.title}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">
              Year of Start:
            </span>
            <span className="text-sm text-primary">{data.year}</span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">
              Principal Investigator:
            </span>
            <span className="text-sm text-primary">{data.pi_name}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Division:</span>
            <span className="text-sm text-primary">{data.division}</span>
          </div>

          {data.tags && (
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-500">Tags:</span>
              <div className="flex flex-wrap gap-2">
                {data.tags.split(",").map((tag, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Description Section */}
        <div className="mb-6">
          <h2 className="text-p mb-2 text-lg font-semibold">Description</h2>
          <p className="whitespace-pre-wrap text-gray-700">
            {data.description}
          </p>
        </div>

        {/* Papers Section */}
        {data.papers && (
          <div className="mb-6">
            <h2 className="mb-2 text-lg font-semibold text-primary">
              Related Papers
            </h2>
            <div className="space-y-2">
              {JSON.parse(data.papers).map(
                (paper: { title: string; url: string }, index: number) => (
                  <div key={index} className="rounded-md bg-gray-50 p-4">
                    <div className="flex items-start space-x-2">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div className="flex justify-between gap-2">
                        <div className="w-1/2">
                          <p className="text-gray-700">{paper.title}</p>
                        </div>
                        <div className="w-1/2">
                          <a
                            href={paper.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {paper.url}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* Metadata Footer */}
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>
              Created: {new Date(data.createdAt).toLocaleDateString()}
            </span>
            <span>
              Last updated: {new Date(data.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="mb-6 flex-col items-center justify-end space-y-2">
        {/* <h1 className="text-3xl font-bold text-primary">{data.title}</h1> */}
        <div className="mt-1 flex space-x-3">
          <Link href="/searchpage">
            <Button variant="outline">Back to Datasets</Button>
          </Link>
          <RedirectToAuthButton />
        </div>
      </div>
    </div>
  );
};

export default page;
