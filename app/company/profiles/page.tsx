import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfilesList from "./ProfilesList";
import FilterComponent from "@/components/FilterComponent";
import { ICompanyInfo } from "@/lib/types";

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const searchParameters = await searchParams;

  const isAISearch = searchParameters
    ? searchParameters["sortBy"] === "relevance"
    : false;
  const { data: companyDataData } = await supabase
    .from("company_info")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  if (!companyDataData) {
    redirect("/get-started?company=true");
  }

  const companyData: ICompanyInfo = companyDataData;

  // --- Data Fetching ---
  const { data: filterData, error: filterError } = await supabase.rpc(
    "get_unique_profile_filters"
  );
  const uniqueJobRoles = filterData?.uniqueJobRoles || [];
  const uniqueIndustryPreferences = filterData?.uniqueIndustryPreferences || [];
  const uniqueWorkStylePreferences =
    filterData?.uniqueWorkStylePreferences || [];
  const uniqueSkills = filterData?.uniqueSkills || [];
  const uniqueLocations = filterData?.uniqueLocations || [];
  if (filterError) {
    console.error("Error fetching unique profile filters:", filterError);
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* <NavbarComponent user={user} /> */}
      <div className="flex items-start h-full gap-5">
        <div className="hidden md:block w-1/3 px-2 h-screen overflow-y-auto sticky top-0 z-10">
          <FilterComponent
            uniqueLocations={uniqueLocations}
            uniqueJobRoles={uniqueJobRoles}
            uniqueIndustryPreferences={uniqueIndustryPreferences}
            uniqueWorkStylePreferences={uniqueWorkStylePreferences}
            uniqueSkills={uniqueSkills}
            isProfilesPage={true}
          />
        </div>
        <div className="w-full md:w-2/3 ">
          <Tabs defaultValue="all_profiles">
            {user && !isAISearch && (
              <TabsList>
                <TabsTrigger value="all_profiles">All Profiles</TabsTrigger>
                <TabsTrigger value="saved_profiles">Saved Profiles</TabsTrigger>
              </TabsList>
            )}

            <Suspense
              fallback={
                <div className="flex flex-col gap-4">
                  <ProfileCardSkeleton />
                  <ProfileCardSkeleton />
                  <ProfileCardSkeleton />
                  <ProfileCardSkeleton />
                </div>
              }
            >
              <TabsContent value="all_profiles">
                <ProfilesList
                  searchParams={searchParams}
                  isFavoriteTabActive={false}
                  uniqueLocations={uniqueLocations}
                  uniqueJobRoles={uniqueJobRoles}
                  uniqueIndustryPreferences={uniqueIndustryPreferences}
                  uniqueWorkStylePreferences={uniqueWorkStylePreferences}
                  uniqueSkills={uniqueSkills}
                  user={user}
                  companyData={companyData}
                  isAllJobsTab={true}
                />
              </TabsContent>
              {user && !isAISearch && (
                <TabsContent value="saved_profiles">
                  <ProfilesList
                    searchParams={searchParams}
                    isFavoriteTabActive={true}
                    uniqueLocations={uniqueLocations}
                    uniqueJobRoles={uniqueJobRoles}
                    uniqueIndustryPreferences={uniqueIndustryPreferences}
                    uniqueWorkStylePreferences={uniqueWorkStylePreferences}
                    uniqueSkills={uniqueSkills}
                    user={user}
                    companyData={companyData}
                  />
                </TabsContent>
              )}
            </Suspense>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

const ProfileCardSkeleton = () => (
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
