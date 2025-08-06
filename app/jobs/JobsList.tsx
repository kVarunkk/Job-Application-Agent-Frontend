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
    const fetchJobsAndRerank = async () => {
      setLoading(true);

      // Fetch user information
      const {
        data: { user: fetchedUser },
      } = await supabase.auth.getUser();

      const { data } = await supabase
        .from("user_info")
        .select("*")
        .eq("user_id", fetchedUser?.id)
        .single();

      if (fetchedUser) setUser(fetchedUser);

      const params = new URLSearchParams(searchParameters.toString());
      params.set("page", (1).toString()); // Ensure page is reset for initial fetch
      params.set("isFavoriteTabActive", isFavoriteTabActive.toString());

      // Initial fetch of jobs from your /api/jobs endpoint
      const res = await fetch(`/api/jobs?${params.toString()}`);
      const result = await res.json();

      if (!res.ok) {
        console.error(
          "Some error occurred while fetching Jobs:",
          result.message
        );
        setLoading(false);
        return;
      }

      const { data: fetchedJobs, count: fetchedCount } = result;

      // --- AI Re-ranking Logic ---
      if (
        params.get("sortBy") === "vector_similarity" &&
        fetchedUser &&
        fetchedJobs &&
        fetchedJobs.length > 0 &&
        data.ai_search_uses <= 3
      ) {
        try {
          const aiRerankRes = await fetch("/api/ai-search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: fetchedUser.id,
              jobs: fetchedJobs.map((job: IJob) => ({
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

            const jobMap = new Map(
              fetchedJobs.map((job: IJob) => [job.id, job])
            );

            const reorderedJobs = rerankedIds
              .map((id: string) => jobMap.get(id))
              .filter(
                (job: IJob) =>
                  job !== undefined && !filteredOutIds.includes(job.id)
              );

            setData(reorderedJobs);
            setCount(reorderedJobs.length);
          } else {
            setData(fetchedJobs);
            setCount(fetchedCount);
          }
        } catch {
          setData(fetchedJobs);
          setCount(fetchedCount);
        }
      } else {
        setData(fetchedJobs);
        setCount(fetchedCount);
      }

      setLoading(false);
    };

    fetchJobsAndRerank();
  }, [isFavoriteTabActive, searchParams, searchParameters, supabase]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <AppLoader
          size="lg"
          text="You're just one step away from your dream job!"
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
        uniqueCompanies={uniqueCompanies}
      />
    );
  }
}
