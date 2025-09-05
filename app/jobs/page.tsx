import FilterComponent from "@/components/FilterComponent";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import JobsList from "./JobsList";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavbarParent, { INavItem } from "@/components/NavbarParent";
import { v4 as uuidv4 } from "uuid";
import { IJob } from "@/lib/types";
import { headers } from "next/headers";
import Link from "next/link";

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
      // onboardingComplete = companyData.filled;
      // ai_search_uses = companyData.ai_search_uses;
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
  let totalCount: number = 0;
  const params = new URLSearchParams(
    searchParameters as Record<string, string>
  );
  try {
    params.set("tab", activeTab);
    const res = await fetch(`${url}/api/jobs?${params.toString()}`, {
      cache: "no-store",
      headers: {
        Cookie: headersList.get("Cookie") || "",
      },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    // if (res.ok) {
    //   initialJobs = result.data || [];
    //   totalCount = result.count || 0;
    // } else {
    //   console.error("Error fetching initial jobs:", result.message);
    // }

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

  const [locationsResult, companiesResult] = await Promise.all([
    supabase.rpc("get_unique_locations"),
    supabase.rpc("get_unique_companies"),
  ]);

  if (locationsResult.error) {
    console.error("Error fetching unique locations:", locationsResult.error);
  }
  const uniqueLocations: {
    location: string;
  }[] = locationsResult.data || [];

  if (companiesResult.error) {
    console.error("Error fetching unique companies:", companiesResult.error);
  }
  const uniqueCompanies = companiesResult.data || [];

  const navItems: INavItem[] = !isCompanyUser
    ? [
        {
          id: uuidv4(),
          label: "Home",
          href: "/",
          type: "equals",
        },
        {
          id: uuidv4(),
          label: "Find Jobs",
          href: "/jobs",
          type: "startswith",
        },
      ]
    : [
        {
          id: uuidv4(),
          label: "Home",
          href: "/company",
          type: "equals",
        },
        {
          id: uuidv4(),
          label: "Job Posts",
          href: "/company/job-posts",
          type: "equals",
        },
        {
          id: uuidv4(),
          label: "Applicants",
          href: "/company/applicants",
          type: "equals",
        },
        {
          id: uuidv4(),
          label: "Profiles",
          href: "/company/profiles",
          type: "equals",
        },
      ];

  return (
    <div>
      <NavbarParent navItems={navItems} />
      <div className="flex items-start px-4 lg:px-20 xl:px-40 2xl:px-80 py-5 h-full gap-5">
        <div className="hidden md:block w-1/3 px-2 h-screen overflow-y-auto sticky top-0 z-10">
          <FilterComponent
            uniqueLocations={uniqueLocations}
            uniqueCompanies={uniqueCompanies}
          />
        </div>
        <div className="w-full md:w-2/3 ">
          <Suspense
            fallback={
              <div className="flex flex-col gap-4">
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </div>
            }
          >
            <Tabs defaultValue={activeTab}>
              {user && !isCompanyUser && !isAISearch && (
                <TabsList>
                  {!applicationStatusFilter && (
                    <TabsTrigger value="all" className="p-0">
                      <Link
                        className="py-1 px-2"
                        href={`/jobs?${new URLSearchParams(
                          Object.fromEntries(
                            Object.entries(
                              searchParameters as Record<string, string>
                            ).filter(([key]) => key !== "tab")
                          )
                        ).toString()}`}
                      >
                        All Jobs
                      </Link>
                    </TabsTrigger>
                  )}
                  {!applicationStatusFilter && (
                    <TabsTrigger value="saved" className="p-0">
                      <Link
                        className="py-1 px-2"
                        href={`/jobs?${new URLSearchParams({
                          ...(searchParameters as Record<string, string>),
                          tab: "saved",
                        }).toString()}`}
                      >
                        Saved Jobs
                      </Link>
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="applied" className="p-0">
                    <Link
                      className="py-1 px-2"
                      href={`/jobs?${new URLSearchParams({
                        ...(searchParameters as Record<string, string>),
                        tab: "applied",
                      }).toString()}`}
                    >
                      Applied Jobs
                    </Link>
                  </TabsTrigger>
                </TabsList>
              )}
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
            </Tabs>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

const JobCardSkeleton = () => (
  <div className="flex flex-col gap-3 p-4 rounded-lg border bg-secondary/50">
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-3 w-full">
        <Skeleton className="h-6 w-3/4 rounded-full" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-24 rounded-full" />
    </div>
  </div>
);
