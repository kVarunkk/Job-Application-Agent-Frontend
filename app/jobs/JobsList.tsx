"use client";

import JobsComponent from "@/components/JobsComponent";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";
import AppLoader from "@/components/AppLoader";
import { IJob } from "@/lib/types";

export default function JobsList({
  searchParams,
  isFavoriteTabActive,
  uniqueLocations,
  uniqueCompanies,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
  uniqueLocations: { location: string }[];
  uniqueCompanies: { company_name: string }[];
  isFavoriteTabActive: boolean;
}) {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [dataState, setData] = useState<IJob[] | never[] | null>();
  const [countState, setCount] = useState<number | null>();
  const searchParameters = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) setUser(user);

      const params = new URLSearchParams(searchParameters.toString());
      params.set("page", (1).toString());
      params.set("isFavoriteTabActive", isFavoriteTabActive.toString());

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const result = await res.json();

      if (!res.ok) console.error("Some error occured while fetching Jobs");

      const { data, count } = result;

      setData(data);
      setCount(count);

      setLoading(false);
    })();
  }, [isFavoriteTabActive, searchParams, searchParameters, supabase]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <AppLoader size="lg" />
      </div>
    );
  } else {
    return (
      <JobsComponent
        initialJobs={dataState || []}
        totalJobs={countState || 0}
        user={user}
        uniqueLocations={uniqueLocations}
        uniqueCompanies={uniqueCompanies}
      />
    );
  }
}
