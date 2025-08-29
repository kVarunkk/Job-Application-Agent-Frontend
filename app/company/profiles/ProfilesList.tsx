"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";
import AppLoader from "@/components/AppLoader";
import { ICompanyInfo, IFormData } from "@/lib/types";
import JobsComponent from "@/components/JobsComponent";

export default function ProfilesList({
  searchParams,
  isFavoriteTabActive,
  uniqueLocations,
  user,
  uniqueJobRoles,
  uniqueIndustryPreferences,
  uniqueWorkStylePreferences,
  uniqueSkills,
  companyData,
  isAllJobsTab = false,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
  uniqueLocations: { location: string }[];
  isFavoriteTabActive: boolean;
  user: User | null;
  uniqueJobRoles: { job_role: string }[];
  uniqueIndustryPreferences: { industry_preference: string }[];
  uniqueWorkStylePreferences: { work_style_preference: string }[];
  uniqueSkills: { skill: string }[];
  companyData: ICompanyInfo;
  isAllJobsTab?: boolean;
}) {
  const supabase = createClient();
  const [dataState, setData] = useState<IFormData[] | never[] | null>();
  const [countState, setCount] = useState<number | null>();
  const searchParameters = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  useEffect(() => {
    const fetchProfilesAndRerank = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("company_info")
        .select("filled")
        .eq("user_id", user?.id)
        .single();

      if (data) {
        setIsOnboardingComplete(data.filled);
      }

      const params = new URLSearchParams(searchParameters.toString());
      params.set("page", (1).toString()); // Ensure page is reset for initial fetch
      params.set("isFavoriteTabActive", isFavoriteTabActive.toString());

      // Initial fetch of jobs from your /api/jobs endpoint
      const res = await fetch(`/api/profiles?${params.toString()}`);
      const result = await res.json();

      if (!res.ok) {
        console.error(
          "Some error occurred while fetching Jobs:",
          result.message
        );
        setLoading(false);
        return;
      }

      const { data: fetchedProfiles, count: fetchedCount } = result;

      // --- AI Re-ranking Logic ---
      if (
        params.get("sortBy") === "relevance" &&
        params.get("job_post") &&
        user &&
        isOnboardingComplete &&
        fetchedProfiles &&
        fetchedProfiles.length > 0 &&
        companyData.ai_search_uses <= 3
      ) {
        try {
          // need to send the id of job_post and
          const aiRerankRes = await fetch("/api/ai-search/profiles", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              job_post_id: params.get("job_post"),
              companyId: companyData.id,
              profiles: fetchedProfiles.map((profile: IFormData) => ({
                user_id: profile.user_id,
                full_name: profile.full_name,
                desired_roles: profile.desired_roles,
                experience_years: profile.experience_years,
                preferred_locations: profile.preferred_locations,
                top_skills: profile.top_skills,
                work_style_preferences: profile.work_style_preferences,
              })),
            }),
          });

          const aiRerankResult: {
            reranked_profile_ids: string[];
            filtered_out_profile_ids: string[];
          } = await aiRerankRes.json();

          if (aiRerankRes.ok && aiRerankResult.reranked_profile_ids) {
            const rerankedIds = aiRerankResult.reranked_profile_ids;
            const filteredOutIds =
              aiRerankResult.filtered_out_profile_ids || [];

            const profilesMap: Map<string, IFormData> = new Map(
              fetchedProfiles.map((profile: IFormData) => [
                profile.user_id,
                profile,
              ])
            );

            const reorderedProfiles = rerankedIds
              .map((user_id: string) => profilesMap.get(user_id))
              .filter(
                (profile): profile is IFormData =>
                  profile !== undefined &&
                  typeof profile.user_id === "string" &&
                  !filteredOutIds.includes(profile.user_id)
              );

            setData(reorderedProfiles);
            setCount(reorderedProfiles.length);
          } else {
            setData(fetchedProfiles);
            setCount(fetchedCount);
          }
        } catch {
          setData(fetchedProfiles);
          setCount(fetchedCount);
        }
      } else {
        setData(fetchedProfiles);
        setCount(fetchedCount);
      }

      setLoading(false);
    };

    fetchProfilesAndRerank();
  }, [
    isFavoriteTabActive,
    searchParams,
    searchParameters,
    supabase,
    user,
    companyData.id,
    companyData.ai_search_uses,
  ]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <AppLoader
          size="lg"
          text="You're just one step away from your dream employee!"
        />
      </div>
    );
  } else {
    return (
      <JobsComponent
        initialJobs={dataState || []}
        totalJobs={countState || 0}
        user={user}
        uniqueLocations={uniqueLocations}
        uniqueJobRoles={uniqueJobRoles}
        uniqueIndustryPreferences={uniqueIndustryPreferences}
        uniqueWorkStylePreferences={uniqueWorkStylePreferences}
        uniqueSkills={uniqueSkills}
        isCompanyUser={true}
        isProfilesPage={true}
        companyId={companyData.id}
        isOnboardingComplete={isOnboardingComplete}
        isAllJobsTab={isAllJobsTab}
        isAppliedJobsTabActive={false}
      />
    );
  }
}
