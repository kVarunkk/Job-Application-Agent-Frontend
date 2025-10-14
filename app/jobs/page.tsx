import FilterComponent from "@/components/FilterComponent";
import { createClient } from "@/lib/supabase/server";
import JobsList from "./JobsList";
import { TabsContent } from "@/components/ui/tabs";
import { IJob } from "@/lib/types";
import { headers } from "next/headers";
import { ClientTabs } from "@/components/ClientTabs";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParameters = await searchParams;
  const applicationStatusFilter = searchParameters
    ? searchParameters["applicationStatus"]
    : false;
  const isAISearch = searchParameters
    ? searchParameters["sortBy"] === "relevance"
    : false;
  const activeTab =
    searchParameters && searchParameters["tab"]
      ? searchParameters["tab"]
      : "all";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isCompanyUser = false;
  let onboardingComplete = false;
  let ai_search_uses = 0;
  if (user) {
    const { data: jobSeekerData } = await supabase
      .from("user_info")
      .select("ai_search_uses, filled")
      .eq("user_id", user?.id)
      .single();
    const { data: companyData } = await supabase
      .from("company_info")
      .select("id, ai_search_uses, filled")
      .eq("user_id", user?.id)
      .single();

    if (companyData) {
      isCompanyUser = true;
    }

    if (jobSeekerData) {
      onboardingComplete = jobSeekerData.filled;
      ai_search_uses = jobSeekerData.ai_search_uses;
    }
  }

  // --- Data Fetching ---
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}`;

  let initialJobs: IJob[] = [];
  let uniqueLocations: { location: string }[] = [];
  let uniqueCompanies: { company_name: string }[] = [];
  let totalCount: number = 0;
  const params = new URLSearchParams(
    searchParameters as Record<string, string>
  );
  try {
    params.set("tab", activeTab);
    const res = await fetch(`${url}/api/jobs?${params.toString()}`, {
      cache: "force-cache",
      next: { revalidate: 3600, tags: ["jobs-feed"] },
      headers: {
        Cookie: headersList.get("Cookie") || "",
      },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    const resFilters = await fetch(`${url}/api/jobs/filters`, {
      cache: "force-cache",
      next: { revalidate: 86400 },
      headers: {
        Cookie: headersList.get("Cookie") || "",
      },
    });

    const filterData = await resFilters.json();

    uniqueLocations = resFilters.ok ? filterData.locations : [];
    uniqueCompanies = resFilters.ok ? filterData.companies : [];

    // --- AI Re-ranking Logic ---

    if (
      params.get("sortBy") === "relevance" &&
      user &&
      result.data &&
      result.data.length > 0 &&
      ai_search_uses <= 3
    ) {
      try {
        const aiRerankRes = await fetch(`${url}/api/ai-search/jobs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: headersList.get("Cookie") || "",
          },
          body: JSON.stringify({
            userId: user.id,
            jobs: result.data.map((job: IJob) => ({
              id: job.id,
              job_name: job.job_name,
              description: job.description,
              visa_requirement: job.visa_requirement,
              salary_range: job.salary_range,
              locations: job.locations,
              experience: job.experience,
            })),
          }),
        });

        const aiRerankResult = await aiRerankRes.json();

        if (aiRerankRes.ok && aiRerankResult.rerankedJobs) {
          const rerankedIds = aiRerankResult.rerankedJobs;
          const filteredOutIds = aiRerankResult.filteredOutJobs || [];
          const jobMap = new Map(result.data.map((job: IJob) => [job.id, job]));
          const reorderedJobs = rerankedIds
            .map((id: string) => jobMap.get(id))
            .filter(
              (job: IJob) =>
                job !== undefined && !filteredOutIds.includes(job.id)
            );
          initialJobs = reorderedJobs || [];
          totalCount = reorderedJobs.length || 0;
        }
      } catch (e) {
        throw e;
      }
    } else {
      initialJobs = result.data || [];
      totalCount = result.count || 0;
    }
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
  }

  return (
    <div>
      <div className="flex items-start px-4 lg:px-20 xl:px-40 2xl:px-80 py-5 h-full gap-5">
        <div className="hidden md:block w-1/3 px-2 sticky top-0 z-10 max-h-[calc(100vh-1.5rem)] overflow-y-auto">
          <FilterComponent
            uniqueLocations={uniqueLocations}
            uniqueCompanies={uniqueCompanies}
            onboardingComplete={onboardingComplete}
            currentPage="jobs"
          />
        </div>
        <div className="w-full md:w-2/3 ">
          <ClientTabs
            user={user}
            isCompanyUser={isCompanyUser}
            isAISearch={isAISearch}
            applicationStatusFilter={applicationStatusFilter}
            page="jobs"
          >
            {!applicationStatusFilter && (
              <TabsContent value="all">
                <JobsList
                  isCompanyUser={isCompanyUser}
                  user={user}
                  uniqueLocations={uniqueLocations}
                  uniqueCompanies={uniqueCompanies}
                  onboardingComplete={onboardingComplete}
                  initialJobs={initialJobs}
                  totalCount={totalCount}
                />
              </TabsContent>
            )}
            {user &&
              !isCompanyUser &&
              !applicationStatusFilter &&
              !isAISearch && (
                <TabsContent value="saved">
                  <JobsList
                    isCompanyUser={isCompanyUser}
                    user={user}
                    uniqueLocations={uniqueLocations}
                    uniqueCompanies={uniqueCompanies}
                    onboardingComplete={onboardingComplete}
                    initialJobs={initialJobs}
                    totalCount={totalCount}
                  />
                </TabsContent>
              )}
            {user && !isCompanyUser && !isAISearch && (
              <TabsContent value="applied">
                <JobsList
                  isCompanyUser={isCompanyUser}
                  user={user}
                  uniqueLocations={uniqueLocations}
                  onboardingComplete={onboardingComplete}
                  uniqueCompanies={uniqueCompanies}
                  initialJobs={initialJobs}
                  totalCount={totalCount}
                />
              </TabsContent>
            )}
          </ClientTabs>
        </div>
      </div>
    </div>
  );
}
