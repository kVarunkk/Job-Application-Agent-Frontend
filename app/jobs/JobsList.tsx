"use client";

import JobsComponent from "@/components/JobsComponent";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { IJob } from "@/lib/types";
// import { createClient } from "@/lib/supabase/client";
// import AppLoader from "@/components/AppLoader";

export default function JobsList({
  uniqueLocations,
  uniqueCompanies,
  user,
  isCompanyUser,
  onboardingComplete,
  initialJobs,
  totalCount,
}: {
  uniqueLocations: { location: string }[];
  uniqueCompanies: { company_name: string }[];
  user: User | null;
  isCompanyUser: boolean;
  onboardingComplete: boolean;
  initialJobs: IJob[];
  totalCount: number;
}) {
  const [dataState, setData] = useState<IJob[]>([]);
  const [countState, setCount] = useState<number>(0);
  const searchParameters = useSearchParams();
  // const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      // const res = await fetch(`/api/jobs?tab=saved`);
      // const result = await res.json();
      // console.log(result);
      // console.log(initialJobs)
      setCount(initialJobs.length);
      setData(initialJobs);
    })();
  }, [initialJobs]);
  // The useEffect hook is now only for **subsequent** data fetching (e.g., pagination, search parameter changes)
  // and AI re-ranking. The initial load is handled by the server component.
  // useEffect(() => {
  //   // Only run this effect if the search parameters change, or a tab is activated
  //   const fetchJobs = async () => {
  //     setLoading(true);

  //     const { data } = isCompanyUser
  //       ? await supabase
  //           .from("company_info")
  //           .select("filled")
  //           .eq("user_id", user?.id)
  //           .single()
  //       : await supabase
  //           .from("user_info")
  //           .select("filled")
  //           .eq("user_id", user?.id)
  //           .single();

  //     setIsOnboardingComplete(data?.filled || false);

  //     const params = new URLSearchParams(searchParameters.toString());
  //     params.set("page", (1).toString()); // Reset to page 1 for new search
  //     // params.set("isFavoriteTabActive", isFavoriteTabActive.toString());
  //     // params.set(
  //     //   "isAppliedJobsTabActive",
  //     //   isAppliedJobsTabActive?.toString() || "false"
  //     // );

  //     // Fetch new jobs based on updated search parameters
  //     const res = await fetch(`/api/jobs?${params.toString()}`);
  //     const result = await res.json();

  //     if (res.ok) {
  //       setData(result.data);
  //       setCount(result.data.length);
  //       setTotalCountState(result.count);
  //     } else {
  //       console.error("Error fetching jobs:", result.message);
  //     }

  //     setLoading(false);
  //   };

  //   // The initial data is already provided by the server, so we only fetch again if a dependency changes.
  //   // The `searchParameters.toString()` dependency handles changes to the URL.
  //   fetchJobs();

  //   // The AI re-ranking logic can be kept here or moved to its own component.
  //   // Given the complexity, it's better to manage it in a client component.
  //   // No changes are needed to the AI re-ranking logic.
  // }, [searchParameters, supabase, user, isCompanyUser]);

  // You can keep the loading state for when the client component fetches new data
  // after the initial server-side render.
  // if (loading) {
  //   return (
  //     <div className="h-screen w-full flex items-center justify-center">
  //       <AppLoader
  //         size="lg"
  //         text="You're just one step away from your dream job!"
  //       />
  //     </div>
  //   );
  // } else {
  return (
    <JobsComponent
      initialJobs={dataState || []}
      totalJobs={countState || 0}
      user={user}
      uniqueLocations={uniqueLocations}
      uniqueCompanies={uniqueCompanies}
      isCompanyUser={isCompanyUser}
      isOnboardingComplete={onboardingComplete}
      isAllJobsTab={!searchParameters.get("tab")}
      isAppliedJobsTabActive={searchParameters.get("tab") === "applied"}
      totalCount={totalCount}
    />
  );
  // }
}
