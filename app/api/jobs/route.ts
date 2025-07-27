import { buildQuery } from "@/lib/filterQueryBuilder";
import { type NextRequest, NextResponse } from "next/server";

const JOBS_PER_PAGE = 20;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Extract filter params
  const jobType = searchParams.get("jobType");
  const location = searchParams.get("location");
  const visaRequirement = searchParams.get("visaRequirement");
  const minSalary = searchParams.get("minSalary");
  const minExperience = searchParams.get("minExperience");
  const platform = searchParams.get("platform");
  const company_name = searchParams.get("company_name");
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");
  const jobTitleKeywords = searchParams.get("jobTitleKeywords");
  const isFavoriteTabActive = searchParams.get("isFavoriteTabActive");

  const startIndex = (page - 1) * JOBS_PER_PAGE;
  const endIndex = startIndex + JOBS_PER_PAGE - 1;

  try {
    const { data, error, count } = await buildQuery({
      jobType,
      location,
      visaRequirement,
      minSalary,
      minExperience,
      platform,
      company_name,
      start_index: startIndex,
      end_index: endIndex,
      sortBy: sortBy ?? undefined,
      sortOrder: sortOrder as "asc" | "desc",
      jobTitleKeywords,
      isFavoriteTabActive: isFavoriteTabActive === "true",
    });
    if (error) {
      console.error("API Error fetching jobs:", error);
      return NextResponse.json({ error: error }, { status: 500 });
    }

    return NextResponse.json({ data: data || [], count });
  } catch (err: unknown) {
    // console.error("API Exception in /api/jobs:", e);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : String(err) || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
