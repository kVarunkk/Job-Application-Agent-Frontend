"use client";

import { IJob } from "@/lib/types";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppLoader from "./AppLoader";
import { User } from "@supabase/supabase-js";
import JobItem from "./JobItem";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import FindSuitableJobs from "./FindSuitableJobs";
import FilterComponentSheet from "./FilterComponentSheet";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

export default function JobsComponent({
  initialJobs,
  totalJobs,
  user,
  uniqueLocations,
  uniqueCompanies,
  isCompanyUser,
}: {
  initialJobs: IJob[];
  totalJobs: number;
  user: User | null;
  uniqueLocations: { location: string }[];
  uniqueCompanies: { company_name: string }[];
  isCompanyUser: boolean;
}) {
  const [jobs, setJobs] = useState<IJob[]>(initialJobs ?? []);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();

  const selectValue =
    searchParams.get("sortBy") &&
    searchParams.get("sortOrder") &&
    searchParams.get("sortBy") !== "vector_similarity"
      ? searchParams.get("sortBy") + "-" + searchParams.get("sortOrder")
      : "";

  const isSuitable = searchParams.get("sortBy") === "vector_similarity";

  useEffect(() => {
    setJobs(initialJobs);
    setPage(1);
  }, [initialJobs]);

  const loadMoreJobs = useCallback(async () => {
    // Prevent multiple simultaneous loads
    if (isLoading || jobs.length >= totalJobs) return;
    setIsLoading(true);

    const nextPage = page + 1;

    // Construct the query string from the current URL search params
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", nextPage.toString());

    try {
      const res = await fetch(`/api/jobs?${params.toString()}`);
      // const newJobs = await res.json();
      if (!res.ok) throw new Error("Some error occured");

      const result = await res.json();

      const { data } = result;

      if (data.length > 0) {
        setPage(nextPage);
        setJobs((prevJobs) => [...prevJobs, ...data]);
      }
    } catch (error) {
      console.error("Failed to fetch more jobs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, jobs.length, totalJobs, page, searchParams]);

  // This effect sets up the IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        // If the loader is intersecting (visible) and we are not already loading
        if (firstEntry.isIntersecting && !isLoading) {
          loadMoreJobs();
        }
      },
      { threshold: 1.0 } // Trigger when 100% of the loader is visible
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    // Cleanup function to disconnect the observer
    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [isLoading, jobs, loadMoreJobs]); // Re-run effect if loading state or jobs change

  const handleSorting = async (value: string) => {
    const [column, order] = value.split("-");
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", column);
    params.set("sortOrder", order);

    setPage(() => 1);

    router.push(`/jobs?${params.toString()}`);
  };

  const navigateBack = async () => {
    const params = new URLSearchParams(searchParams.toString());
    const sortBy = params.get("sortBy");

    if (sortBy === "vector_similarity") {
      params.delete("sortBy");
    }

    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {jobs.length > 0 && (
        <div className="w-full flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center ">
            {isSuitable && (
              <Button
                onClick={navigateBack}
                variant={"ghost"}
                className="rounded-full"
              >
                <ArrowLeft />
              </Button>
            )}
            <p className="text-sm text-muted-foreground">
              Showing {jobs.length} {isSuitable ? "suitable" : ""}{" "}
              {jobs.length > 1 ? "jobs" : "job"}
            </p>
          </div>

          <FilterComponentSheet
            uniqueLocations={uniqueLocations}
            uniqueCompanies={uniqueCompanies}
          />

          <div className="flex items-center gap-3">
            {user && !isCompanyUser && (
              <FindSuitableJobs user={user} setPage={setPage} />
            )}
            {searchParams.get("sortBy") !== "vector_similarity" && (
              <Select
                value={selectValue}
                onValueChange={(value) => handleSorting(value)}
              >
                <SelectTrigger className="max-w-[120px] sm:max-w-full bg-input">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="company_name-asc">
                    Company Name (A-Z)
                  </SelectItem>
                  <SelectItem value="company_name-desc">
                    Company Name (Z-A)
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}
      {jobs.length > 0 ? (
        jobs.map((job) => (
          <JobItem
            isCompanyUser={isCompanyUser}
            key={job.id}
            job={job}
            user={user}
            isSuitable={isSuitable}
          />
        ))
      ) : (
        <p className="text-muted-foreground mt-20 mx-auto">
          No jobs found for the selected Filter.{" "}
          <Link href={"/jobs"} className="underline">
            Clear Filters
          </Link>
        </p>
      )}

      {/* Loading Spinner and Trigger */}
      {jobs.length < totalJobs && (
        <div ref={loaderRef} className="flex justify-center items-center p-4">
          <AppLoader size="md" />
        </div>
      )}
    </div>
  );
}
