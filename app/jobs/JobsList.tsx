"use client";

import JobsComponent from "@/components/JobsComponent";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { IJob } from "@/lib/types";

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
  const [loading, setLoading] = useState(true);
  const [countState, setCount] = useState<number>(0);
  const searchParameters = useSearchParams();

  useEffect(() => {
    (async () => {
      setCount(initialJobs.length);
      setData(initialJobs);
      setLoading(false);
    })();
  }, [initialJobs]);

  if (loading) {
    return <div>Loading...</div>;
  } else
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
}
