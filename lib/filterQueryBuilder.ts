import { createClient } from "./supabase/server";

export const buildQuery = async ({
  jobType,
  visaRequirement,
  location,
  minSalary,
  minExperience,
  platform,
  companyName,
  start_index,
  end_index,
  jobTitleKeywords,
  isFavoriteTabActive,
  isAppliedJobsTabActive,
  sortBy,
  sortOrder,
  userEmbedding,
  applicationStatus,
}: {
  jobType?: string | null;
  visaRequirement?: string | null;
  location?: string | null;
  minSalary?: string | null;
  minExperience?: string | null;
  platform?: string | null;
  companyName?: string | null;
  start_index: number;
  end_index: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  jobTitleKeywords?: string | null;
  isFavoriteTabActive: boolean;
  isAppliedJobsTabActive?: boolean;
  userEmbedding?: string | null;
  applicationStatus?: string | null;
}) => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const parseMultiSelectParam = (
      param: string | null | undefined
    ): string[] => {
      return param
        ? param
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
    };

    let query;
    let selectString;

    if (isFavoriteTabActive) {
      if (!user) {
        return {
          data: [],
          error: "User not authenticated to view favorite jobs.",
          count: 0,
        };
      }
      selectString = `*, user_favorites!inner(user_id), job_postings(*, company_info(*), applications(*))`;
      query = supabase
        .from("all_jobs")
        .select(selectString, { count: "exact" })
        .eq("user_favorites.user_id", user.id)
        .eq("status", "active");
    } else if (isAppliedJobsTabActive) {
      if (!user) {
        return {
          data: [],
          error: "User not authenticated to view applied jobs.",
          count: 0,
        };
      }
      selectString = `
    *,
    job_postings!inner (
      *,
      company_info(*),
      applications!inner (
        *
      )
    )
  `;
      query = supabase
        .from("all_jobs")
        .select(selectString, { count: "exact" })
        .eq("job_postings.applications.applicant_user_id", user.id);
    } else {
      selectString =
        "*, user_favorites(*), job_postings(*, company_info(*), applications(*))";
      query = supabase
        .from("all_jobs")
        .select(selectString, { count: "exact" })
        .eq("status", "active");
    }

    // --- NEW: VECTOR SEARCH LOGIC ---
    if (sortBy === "relevance" && userEmbedding) {
      // Re-build the query to include the similarity score and order by it
      const { data: searchData, error: searchError } = await supabase.rpc(
        "match_all_jobs",
        {
          embedding: userEmbedding,
          match_threshold: 0.5, // You can adjust this threshold
          match_count: 20, // Fetch a larger set to then apply filters
        }
      );

      if (searchError) {
        console.error("Vector search error:", searchError);
        throw searchError;
      }

      const matchedJobIds = searchData.map((job: { id: string }) => job.id);

      // We now filter the main query to only include the matched jobs
      query = query.in("id", matchedJobIds);
    }
    // --- END NEW LOGIC ---

    if (isFavoriteTabActive && user) {
      query = query.filter("user_favorites.user_id", "eq", user.id);
    }

    // Existing filters...
    const jobTypesArray = parseMultiSelectParam(jobType);
    if (jobTypesArray.length > 0) {
      query = query.in("job_type", jobTypesArray);
    }

    const visaRequirementsArray = parseMultiSelectParam(visaRequirement);
    if (visaRequirementsArray.length > 0) {
      query = query.in("visa_requirement", visaRequirementsArray);
    }

    const locationsArray = parseMultiSelectParam(location);
    if (locationsArray.length > 0) {
      query = query.overlaps("locations", locationsArray);
    }

    const platformsArray = parseMultiSelectParam(platform);
    if (platformsArray.length > 0) {
      query = query.in("platform", platformsArray);
    }

    const companyNamesArray = parseMultiSelectParam(companyName);
    if (companyNamesArray.length > 0) {
      query = query.in("company_name", companyNamesArray);
    }

    const jobTitleKeywordsArray = parseMultiSelectParam(jobTitleKeywords);
    if (jobTitleKeywordsArray.length > 0) {
      const orConditions = jobTitleKeywordsArray
        .map((keyword) => `job_name.ilike.%${keyword}%`)
        .join(",");
      query = query.or(orConditions);
    }

    const applicationStatusArray = parseMultiSelectParam(applicationStatus);
    if (applicationStatusArray.length > 0) {
      query = query.in(
        "job_postings.applications.status",
        applicationStatusArray
      );
    }

    if (minSalary) {
      query = query.gte("salary_min", parseInt(minSalary as string));
    }
    if (minExperience) {
      query = query.lte("experience_min", parseInt(minExperience as string));
    }

    // Apply sorting conditionally
    if (sortBy && sortBy !== "relevance") {
      query = query.order(sortBy, { ascending: sortOrder === "asc" });
    }

    // Apply pagination
    query = query.range(start_index, end_index);

    const { data, error, count } = await query;

    return {
      data,
      error: error?.details,
      count,
    };
  } catch (e: unknown) {
    return {
      data: [],
      error:
        e instanceof Error
          ? e.message
          : "Some error occurred while fetching Jobs",
      count: 0,
    };
  }
};
