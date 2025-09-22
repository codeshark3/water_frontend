"use client";

import React, { useState, useCallback } from "react";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";
import { getDatasetsForSearch } from "~/server/dataset_queries";
import Link from "next/link";
import Image from "next/image";
import debounce from "lodash/debounce";

interface Dataset {
  id: string;
  title: string;
  description: string;
  pi_name: string;
  division: string;
  year: string;
}

const Page = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Dataset[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      try {
        const data = await getDatasetsForSearch(searchQuery);
        setResults(data);
        setShowDropdown(true);
      } catch (error) {
        console.error("Search error:", error);
      }
    }, 300),
    [],
  );

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    debouncedSearch(searchQuery);
  };

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-start py-8">
      <div className="flex flex-col items-center">
        <Image
          src="/assets/images/logo.png"
          alt="logo"
          width={100}
          height={100}
          className="mb-4"
        />
        <h1 className="mb-8 text-center text-3xl font-bold">Search Datasets</h1>
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search datasets..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        </div>

        {showDropdown && results.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
            {results.map((dataset) => (
              <div
                key={dataset.id}
                className="cursor-pointer p-3 hover:bg-gray-100"
                onClick={() => {
                  setQuery(dataset.title);
                  setShowDropdown(false);
                }}
              >
                <Link href={`/searchpage/${dataset.id}`}>
                  <div className="font-semibold">{dataset.title}</div>
                  <div className="line-clamp-1 text-sm text-gray-600">
                    {dataset.description}
                  </div>
                  <div className="text-xs text-gray-500">
                    {dataset.pi_name} • {dataset.division}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* {query.length > 0 && !showDropdown && (
        <div className="mt-6">
          {results.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((dataset) => (
                <div
                  key={dataset.id}
                  className="rounded-lg border p-4 shadow-sm hover:shadow-md"
                >
                  <Link href={`/dataset/${dataset.id}`}>
                    <h3 className="font-semibold">{dataset.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {dataset.description}
                    </p>
                    <div className="mt-2 text-sm text-gray-500">
                      {dataset.year} {dataset.pi_name} • {dataset.division} •{" "}
                      {dataset.year}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No datasets found</p>
          )}
        </div>
      )} */}
    </div>
  );
};

export default Page;
