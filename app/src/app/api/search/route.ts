import { NextResponse } from "next/server";
import { getDatasets } from "~/server/dataset_queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.toLowerCase() || "";

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  const datasets = await getDatasets();

  const results = datasets.filter(
    (dataset) =>
      dataset.title.toLowerCase().includes(query) ||
      dataset.description.toLowerCase().includes(query) ||
      dataset.pi_name.toLowerCase().includes(query) ||
      dataset.division.toLowerCase().includes(query),
  );

  return NextResponse.json(results.slice(0, 10)); // Limit to 10 results
}
