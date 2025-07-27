// buildQuery.ts
import { createClient } from "./supabase/server"; // Assuming this path is correct

export const buildQuery = async ({
  jobType,
  visaRequirement,
  location,
  minSalary,
  minExperience,
  platform,
  company_name,
  start_index,
  end_index,
  jobTitleKeywords,
  isFavoriteTabActive,
}: {
  jobType?: string | null;
  visaRequirement?: string | null;
  location?: string | null;
  minSalary?: string | null;
  minExperience?: string | null;
  platform?: string | null;
  company_name?: string | null;
  start_index: number;
  end_index: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  jobTitleKeywords?: string | null;
  isFavoriteTabActive: boolean;
}) => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query;
    // = supabase
    //   .from("all_jobs")
    //   .select("*, user_favorites(*)", { count: "exact" })
    //   .order(sortBy, { ascending: sortOrder === "asc" });

    let selectString = "*, user_favorites(*)"; // Default select string

    // --- CORRECTED LOGIC FOR FAVORITE JOBS TAB ---
    if (isFavoriteTabActive) {
      if (!user) {
        // If favorite tab is active but no user is logged in, return no jobs
        return {
          data: [],
          error: "User not authenticated to view favorite jobs.",
          count: 0,
        };
      }
      // Use an INNER JOIN to only include jobs that have a favorite entry for this user.
      // The '!' makes it an INNER JOIN.
      selectString = `*, user_favorites!inner(user_id)`; // Select user_id from user_favorites with inner join
      query = supabase
        .from("all_jobs")
        .select(selectString, { count: "exact" })
        .eq("user_favorites.user_id", user.id); // Filter on the inner-joined user_id
    } else {
      // If not favorite tab, select all jobs with left join to favorites
      query = supabase
        .from("all_jobs")
        .select(selectString, { count: "exact" });
    }

    // Helper function to parse comma-separated string into array
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

    // --- Apply filters based on column type ---

    if (isFavoriteTabActive && user) {
      query = query.filter("user_favorites.user_id", "eq", user.id);
    }

    // Job Type (assuming single TEXT column, use .in())
    const jobTypesArray = parseMultiSelectParam(jobType);
    if (jobTypesArray.length > 0) {
      query = query.in("job_type", jobTypesArray);
    }

    // Visa Requirement (assuming single TEXT column, use .in())
    const visaRequirementsArray = parseMultiSelectParam(visaRequirement);
    if (visaRequirementsArray.length > 0) {
      query = query.in("visa_requirement", visaRequirementsArray);
    }

    // Location (THIS IS THE ARRAY COLUMN, use .overlaps())
    const locationsArray = parseMultiSelectParam(location);
    if (locationsArray.length > 0) {
      query = query.overlaps("locations", locationsArray);
    }

    // Platform (assuming single TEXT column, use .in())
    const platformsArray = parseMultiSelectParam(platform);
    if (platformsArray.length > 0) {
      query = query.in("platform", platformsArray);
    }

    // Company Name (assuming single TEXT column, use .in())
    const companyNamesArray = parseMultiSelectParam(company_name);
    if (companyNamesArray.length > 0) {
      query = query.in("company_name", companyNamesArray);
    }

    const jobTitleKeywordsArray = parseMultiSelectParam(jobTitleKeywords);
    if (jobTitleKeywordsArray.length > 0) {
      // Construct the OR condition string for ilike
      const orConditions = jobTitleKeywordsArray
        .map(
          (keyword) => `job_name.ilike.%${keyword}%` // Matches 'title ILIKE %keyword%'
        )
        .join(","); // Join with commas for the OR clause

      query = query.or(orConditions);
    }

    // --- Apply filters for single-value columns (minSalary, minExperience) ---
    if (minSalary) {
      query = query.gte("salary_min", parseInt(minSalary as string));
    }
    if (minExperience) {
      query = query.lte("experience_min", parseInt(minExperience as string));
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
