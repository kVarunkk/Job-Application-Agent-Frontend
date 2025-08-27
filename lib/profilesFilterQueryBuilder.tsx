import { createClient } from "./supabase/server";

export async function buildProfileQuery({
  searchQuery,
  jobRoles,
  locations,
  minExperience,
  maxExperience,
  minSalary,
  maxSalary,
  skills,
  workStyle,
  companySize,
  industry,
  visaRequired,
  sortKey,
  sortOrder,
  start_index,
  end_index,
  isFavoriteTabActive = false,
  jobEmbedding,
}: {
  searchQuery?: string;
  jobRoles?: string[];
  locations?: string[];
  minExperience?: number;
  maxExperience?: number;
  minSalary?: number;
  maxSalary?: number;
  skills?: string[];
  workStyle?: string[];
  companySize?: string[];
  industry?: string[];
  visaRequired?: boolean;
  sortKey?: string;
  sortOrder?: "asc" | "desc";
  start_index: number;
  end_index: number;
  isFavoriteTabActive?: boolean;
  jobEmbedding?: string | null;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let query;
    let selectString;

    if (isFavoriteTabActive) {
      if (!user) {
        return {
          data: [],
          error: "User not authenticated to view favorite profiles.",
          count: 0,
        };
      }
      // Assuming you have fetched the companyId of the logged-in user
      const { data: companyData } = await supabase
        .from("company_info")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!companyData) {
        return {
          data: [],
          error: "Company profile not found.",
          count: 0,
        };
      }

      const companyId = companyData.id;

      selectString = `*, company_favorites!inner(company_id)`;
      query = supabase
        .from("user_info")
        .select(selectString, { count: "exact" })
        .eq("company_favorites.company_id", companyId)
        .eq("filled", true);
    } else {
      query = supabase
        .from("user_info")
        .select(
          `
          *, company_favorites(*)
        `,
          { count: "exact" }
        )
        .eq("filled", true);
    }

    // --- NEW: VECTOR SEARCH LOGIC ---
    if (sortKey === "relevance" && jobEmbedding) {
      // Re-build the query to include the similarity score and order by it
      const { data: searchData, error: searchError } = await supabase.rpc(
        "match_user_profiles",
        {
          job_embedding: jobEmbedding,
          match_threshold: 0.5, // You can adjust this threshold
          match_count: 50, // Fetch a larger set to then apply filters
        }
      );

      if (searchError) {
        console.error("Vector search error:", searchError);
        throw searchError;
      }

      const matchedProfileIds = searchData.map(
        (userInfo: { user_id: string }) => userInfo.user_id
      );

      // We now filter the main query to only include the matched jobs
      query = query.in("user_id", matchedProfileIds);
    }
    // --- END NEW LOGIC ---

    // Apply filters
    if (searchQuery) {
      query = query.ilike("full_name", `%${searchQuery}%`);
    }
    if (jobRoles) {
      query = query.contains("desired_roles", jobRoles);
    }
    if (locations) {
      query = query.overlaps("preferred_locations", locations);
    }
    if (minExperience !== undefined) {
      query = query.gte("experience_years", minExperience);
    }
    if (maxExperience !== undefined) {
      query = query.lte("experience_years", maxExperience);
    }
    if (minSalary !== undefined) {
      query = query.gte("min_salary", minSalary);
    }
    if (maxSalary !== undefined) {
      query = query.lte("max_salary", maxSalary);
    }
    if (skills) {
      query = query.overlaps("top_skills", skills);
    }
    if (workStyle) {
      query = query.contains("work_style_preferences", workStyle);
    }
    if (companySize) {
      query = query.in("company_size_preference", companySize);
    }
    if (industry) {
      query = query.contains("industry_preferences", industry);
    }
    if (visaRequired !== undefined) {
      query = query.eq("visa_sponsorship_required", visaRequired);
    }

    // Apply sorting
    if (sortKey && sortOrder) {
      query = query.order(sortKey, { ascending: sortOrder === "asc" });
    } else {
      query = query.order("experience_years", { ascending: false }); // Default sort
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
}
