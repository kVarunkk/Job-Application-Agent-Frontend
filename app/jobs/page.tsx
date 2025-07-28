import FilterComponent from "@/components/FilterComponent";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import JobsList from "./JobsList";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavbarComponent from "@/components/Navbar";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // --- Data Fetching ---

  const [locationsResult, companiesResult] = await Promise.all([
    supabase.rpc("get_unique_locations"),
    supabase.rpc("get_unique_companies"), // <-- Call the new function
  ]);

  // Handle locations
  if (locationsResult.error) {
    console.error("Error fetching unique locations:", locationsResult.error);
  }
  const uniqueLocations = locationsResult.data || [];

  // Handle companies
  if (companiesResult.error) {
    console.error("Error fetching unique companies:", companiesResult.error);
  }
  const uniqueCompanies = companiesResult.data || [];

  return (
    <div>
      <NavbarComponent user={user} />
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
              // This fallback is shown while JobList fetches data
              <div className="flex flex-col gap-4">
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </div>
            }
          >
            <Tabs defaultValue="all_jobs" className="">
              {user && (
                <TabsList>
                  <TabsTrigger value="all_jobs">All Jobs</TabsTrigger>
                  <TabsTrigger value="saved_jobs">Saved Jobs</TabsTrigger>
                </TabsList>
              )}
              <TabsContent value="all_jobs">
                <JobsList
                  searchParams={searchParams}
                  isFavoriteTabActive={false}
                  uniqueLocations={uniqueLocations}
                  uniqueCompanies={uniqueCompanies}
                />
              </TabsContent>
              {user && (
                <TabsContent value="saved_jobs">
                  <JobsList
                    searchParams={searchParams}
                    isFavoriteTabActive={true}
                    uniqueLocations={uniqueLocations}
                    uniqueCompanies={uniqueCompanies}
                  />
                </TabsContent>
              )}
            </Tabs>
            {/* This component will fetch its own data */}
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
