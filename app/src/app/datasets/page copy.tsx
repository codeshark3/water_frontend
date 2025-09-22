import Link from "next/link";
import React from "react";
import { getDatasets } from "~/server/dataset_queries";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { Plus, Search } from "lucide-react";
import { Button } from "~/components/ui/button";

import { RowsPerPageSelect } from "~/components/RowsPerPageSelect";
import { Input } from "~/components/ui/input";

interface SearchParams {
  search?: string;
  page?: string;
  perPage?: string;
}

const rowsPerPageOptions = [25, 50, 100];

const DatasetsPage = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const data = await getDatasets();
  const searchQuery = (searchParams?.search || "").toLowerCase();
  const currentPage = Number(searchParams?.page) || 1;
  const itemsPerPage = Number(searchParams?.perPage) || 25;

  const filteredData = searchQuery
    ? data.filter(
        (dataset) =>
          dataset.title.toLowerCase().includes(searchQuery) ||
          (dataset.description &&
            dataset.description.toLowerCase().includes(searchQuery)),
      )
    : data;

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

  // Generate pagination range
  const generatePaginationRange = () => {
    const range = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    range.push(1);

    // Calculate middle range
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 2) {
      end = 4;
    }
    if (currentPage >= totalPages - 1) {
      start = totalPages - 3;
    }

    // Add ellipsis if needed
    if (start > 2) {
      range.push("...");
    }

    // Add middle range
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Add ellipsis if needed
    if (end < totalPages - 1) {
      range.push("...");
    }

    // Always show last page
    range.push(totalPages);

    return range;
  };

  return (
    <div>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Datasets</h1>
          <Link
            href="/datasets/create"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create New Dataset
          </Link>
        </div>

        <form className="mb-6">
          <div className="relative">
            <Input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search datasets..."
              className="w-full rounded-lg border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-primary"
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <div className="grid gap-4">
          {currentItems.length === 0 ? (
            <div className="rounded-lg bg-gray-50 py-12 text-center">
              <p className="text-gray-500">
                {searchQuery
                  ? "No datasets found matching your search."
                  : "No datasets found. Create your first dataset!"}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y rounded-lg bg-white shadow">
                {currentItems.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <Link
                      href={`/datasets/${dataset.id}`}
                      className="px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/90"
                    >
                      {" "}
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-primary">
                          {dataset.title}
                        </h3>
                        {dataset.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                            {dataset.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(endIndex, totalItems)}{" "}
                  of {totalItems} entries
                </div>

                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href={`/datasets?page=${currentPage - 1}&perPage=${itemsPerPage}${searchQuery ? `&search=${searchQuery}` : ""}`}
                        aria-disabled={currentPage <= 1}
                        className={
                          currentPage <= 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {generatePaginationRange().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === "..." ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            href={`/datasets?page=${page}&perPage=${itemsPerPage}${searchQuery ? `&search=${searchQuery}` : ""}`}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href={`/datasets?page=${currentPage + 1}&perPage=${itemsPerPage}${searchQuery ? `&search=${searchQuery}` : ""}`}
                        aria-disabled={currentPage >= totalPages}
                        className={
                          currentPage >= totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm text-gray-500">Rows per page:</span>
                  <RowsPerPageSelect defaultValue={itemsPerPage} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasetsPage;
