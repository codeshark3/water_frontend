"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Search } from "lucide-react";
import { cn } from "~/lib/utils";

interface Dataset {
  id: string;
  title: string;
  description: string;
  pi_name: string;
  division: string;
}

export default function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [results, setResults] = useState<Dataset[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/search?query=${encodeURIComponent(query)}`,
        );
        const data = await response.json();
        setResults(data);
        setShowDropdown(true);
      } catch (error) {
        console.error("Search error:", error);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    router.push(`/searchpage?${createQueryString("query", query)}`);
  };

  return (
    <div className="relative">
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search datasets..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xl"
          onFocus={() => setShowDropdown(true)}
        />
        <Button type="submit">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </form>

      {showDropdown && results.length > 0 && (
        <div className="absolute mt-1 w-full max-w-xl rounded-md border bg-white shadow-lg">
          <ul className="max-h-64 overflow-auto py-2">
            {results.map((result) => (
              <li
                key={result.id}
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  router.push(`/datasets/${result.id}`);
                  setShowDropdown(false);
                }}
              >
                <div className="font-medium">{result.title}</div>
                <div className="text-sm text-gray-500">
                  {result.pi_name} • {result.division}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
