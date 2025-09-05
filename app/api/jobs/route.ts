import { buildQuery } from "@/lib/filterQueryBuilder";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const JOBS_PER_PAGE = 20;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Extract filter params
  const jobType = searchParams.get("jobType");
  const location = searchParams.get("location");
  const visaRequirement = searchParams.get("visaRequirement");
  const minSalary = searchParams.get("minSalary");
  const minExperience = searchParams.get("minExperience");
  const platform = searchParams.get("platform");
  const companyName = searchParams.get("companyName");
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");
  const jobTitleKeywords = searchParams.get("jobTitleKeywords");
  const isFavoriteTabActive = searchParams.get("tab") === "saved";
  const isAppliedJobsTabActive = searchParams.get("tab") === "applied";
  const applicationStatus = searchParams.get("applicationStatus");

  const startIndex = (page - 1) * JOBS_PER_PAGE;
  const endIndex = startIndex + JOBS_PER_PAGE - 1;

  try {
    let userEmbedding = null;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (sortBy === "relevance" && user) {
      const { data: userData, error } = await supabase
        .from("user_info")
        .select("embedding")
        .eq("user_id", user.id)
        .single();

      if (error || !userData) {
        console.error("Error fetching user embedding:", error);
        // You might want to handle this gracefully for users without an embedding
      } else {
        userEmbedding = userData.embedding;
      }
    }

    const { data, error, count } = await buildQuery({
      jobType,
      location,
      visaRequirement,
      minSalary,
      minExperience,
      platform,
      companyName,
      start_index: startIndex,
      end_index: endIndex,
      sortBy: sortBy ?? undefined,
      sortOrder: sortOrder as "asc" | "desc",
      jobTitleKeywords,
      isFavoriteTabActive: isFavoriteTabActive,
      isAppliedJobsTabActive: isAppliedJobsTabActive,
      userEmbedding,
      applicationStatus,
    });

    if (error) {
      console.error("API Error fetching jobs:", error);
      return NextResponse.json({ error: error }, { status: 500 });
    }

    return NextResponse.json({ data: data || [], count });
  } catch (err: unknown) {
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
