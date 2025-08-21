import { buildProfileQuery } from "@/lib/profilesFilterQueryBuilder";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
const PROFILES_PER_PAGE = 20;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);

  // --- Check if user is an authenticated company user ---
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: companyData, error: companyError } = await supabase
    .from("company_info")
    .select("id, job_postings(id, embedding)")
    .eq("user_id", user.id)
    .single();
  if (companyError || !companyData) {
    return NextResponse.json(
      { error: "Unauthorized: Not a company user" },
      { status: 403 }
    );
  }

  // Extract filter params
  const searchQuery = searchParams.get("search");
  const jobRoles = searchParams.get("jobRoles")?.split(",");
  const locations = searchParams.get("locations")?.split(",");
  const minExperience = parseInt(searchParams.get("minExperience") || "", 10);
  const maxExperience = parseInt(searchParams.get("maxExperience") || "", 10);
  const minSalary = parseInt(searchParams.get("minSalary") || "", 10);
  const maxSalary = parseInt(searchParams.get("maxSalary") || "", 10);
  const skills = searchParams.get("skills")?.split(",");
  const workStyle = searchParams.get("workStyle")?.split(",");
  const companySize = searchParams.get("companySize")?.split(",");
  const industry = searchParams.get("industry")?.split(",");
  const visaRequired = searchParams.get("visaRequired") === "true";
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");
  const isFavoriteTabActive = searchParams.get("isFavoriteTabActive");
  const job_post_id = searchParams.get("job_post");

  const startIndex = (page - 1) * PROFILES_PER_PAGE;
  const endIndex = startIndex + PROFILES_PER_PAGE - 1;
  const jobEmbedding =
    companyData.job_postings?.find((job) => job.id === job_post_id)
      ?.embedding || null;

  try {
    const { data, error, count } = await buildProfileQuery({
      searchQuery: searchQuery ?? undefined,
      jobRoles,
      locations,
      minExperience: isNaN(minExperience) ? undefined : minExperience,
      maxExperience: isNaN(maxExperience) ? undefined : maxExperience,
      minSalary: isNaN(minSalary) ? undefined : minSalary,
      maxSalary: isNaN(maxSalary) ? undefined : maxSalary,
      skills,
      workStyle,
      companySize,
      industry,
      visaRequired: searchParams.has("visaRequired") ? visaRequired : undefined,
      sortKey: sortBy ?? undefined,
      sortOrder: sortOrder as "asc" | "desc",
      start_index: startIndex,
      end_index: endIndex,
      isFavoriteTabActive: isFavoriteTabActive === "true",
      jobEmbedding,
    });

    if (error) {
      console.error("API Error fetching profiles:", error);
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
