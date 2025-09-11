"use client";

import { IFormData, IJob } from "@/lib/types";
import Link from "next/link";
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppLoader from "./AppLoader";
import { User } from "@supabase/supabase-js";
import JobItem from "./JobItem";
import FindSuitableJobs from "./FindSuitableJobs";
import FilterComponentSheet from "./FilterComponentSheet";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import ProfileItem from "./ProfileItem";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import ScrollToTopButton from "./ScrollToTopButton";
import SortingComponent from "./SortingComponent";
import { useProgress } from "react-transition-progress";

export default function JobsComponent({
  initialJobs,
  totalJobs,
  user,
  uniqueLocations,
  uniqueCompanies,
  isCompanyUser,
  isProfilesPage = false,
  uniqueJobRoles,
  uniqueIndustryPreferences,
  uniqueWorkStylePreferences,
  uniqueSkills,
  companyId,
  isOnboardingComplete,
  isAllJobsTab,
  isAppliedJobsTabActive,
  totalCount,
}: {
  initialJobs: IJob[] | IFormData[];
  totalJobs: number;
  user: User | null;
  uniqueLocations: { location: string }[];
  uniqueCompanies?: { company_name: string }[];
  isCompanyUser: boolean;
  isProfilesPage?: boolean;
  uniqueJobRoles?: { job_role: string }[];
  uniqueIndustryPreferences?: { industry_preference: string }[];
  uniqueWorkStylePreferences?: { work_style_preference: string }[];
  uniqueSkills?: { skill: string }[];
  companyId?: string;
  isOnboardingComplete: boolean;
  isAllJobsTab: boolean;
  isAppliedJobsTabActive: boolean;
  totalCount: number;
}) {
  const [jobs, setJobs] = useState<IJob[] | IFormData[]>(initialJobs ?? []);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const isSuitable = searchParams.get("sortBy") === "relevance";
  const startProgress = useProgress();
  useEffect(() => {
    setJobs(initialJobs);
    setPage(1);
  }, [initialJobs]);

  const loadMoreJobs = useCallback(async () => {
    if (isLoading || jobs.length >= totalCount) return;
    setIsLoading(true);

    const nextPage = page + 1;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", nextPage.toString());
    params.set(
      "tab",
      isAllJobsTab ? "all" : isAppliedJobsTabActive ? "applied" : "saved"
    );

    try {
      const res = await fetch(
        `/api/${
          isProfilesPage && isCompanyUser ? "profiles" : "jobs"
        }?${params.toString()}`
      );
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
  }, [
    isLoading,
    jobs.length,
    totalJobs,
    page,
    searchParams,
    isCompanyUser,
    isProfilesPage,
    isAllJobsTab,
  ]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && !isLoading) {
          loadMoreJobs();
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [isLoading, jobs, loadMoreJobs]); // Re-run effect if loading state or jobs change

  const navigateBack = async () => {
    const params = new URLSearchParams(searchParams.toString());
    const sortBy = params.get("sortBy");
    const jobPost = params.get("job_post");

    if (sortBy === "relevance") {
      params.delete("sortBy");
    }
    if (jobPost) {
      params.delete("job_post");
    }

    startTransition(() => {
      startProgress();
      router.push(
        `/${
          isProfilesPage && isCompanyUser ? "company/profiles" : "jobs"
        }?${params.toString()}`
      );
    });
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
              Showing {jobs.length} {isSuitable ? "suitable" : ""}
              {totalCount ? ` of ${totalCount}` : ""}{" "}
              {isProfilesPage && isCompanyUser ? "profiles" : "jobs"}
            </p>
          </div>
          <FilterComponentSheet
            uniqueLocations={uniqueLocations}
            uniqueCompanies={uniqueCompanies ?? []}
            uniqueJobRoles={uniqueJobRoles ?? []}
            uniqueIndustryPreferences={uniqueIndustryPreferences ?? []}
            uniqueWorkStylePreferences={uniqueWorkStylePreferences ?? []}
            uniqueSkills={uniqueSkills ?? []}
            isCompanyUser={isCompanyUser}
            isProfilesPage={isProfilesPage}
            onboardingComplete={isOnboardingComplete}
          />

          <div className="flex items-center gap-3">
            {user &&
              isOnboardingComplete &&
              !isCompanyUser &&
              !isProfilesPage &&
              isAllJobsTab && (
                <FindSuitableJobs
                  user={user}
                  setPage={setPage}
                  isProfilesPage={isProfilesPage}
                  companyId={companyId}
                />
              )}
            {user &&
              isOnboardingComplete &&
              isCompanyUser &&
              isProfilesPage &&
              isAllJobsTab && (
                <FindSuitableJobs
                  user={user}
                  setPage={setPage}
                  isProfilesPage={isProfilesPage}
                  companyId={companyId}
                />
              )}

            {!isOnboardingComplete && user && !isCompanyUser && (
              <Tooltip delayDuration={100}>
                <TooltipTrigger className="cursor-default" asChild>
                  <Link
                    href={
                      isCompanyUser
                        ? "/get-started?company=true&edit=true"
                        : "/get-started?edit=true"
                    }
                  >
                    <Button className="rounded-full text-sm">
                      Complete Onboarding
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  Complete Onboarding to use AI Smart Search
                </TooltipContent>
              </Tooltip>
            )}

            {searchParams.get("sortBy") !== "relevance" && (
              <SortingComponent
                isCompanyUser={isCompanyUser}
                isProfilesPage={isProfilesPage}
                setPage={setPage}
              />
            )}
          </div>
        </div>
      )}

      {jobs.length > 0 ? (
        isProfilesPage && isCompanyUser ? (
          (jobs as IFormData[]).map((job) => (
            <ProfileItem
              key={job.user_id}
              profile={job}
              isSuitable={isSuitable}
              companyId={companyId}
            />
          ))
        ) : (
          (jobs as IJob[]).map((job) => (
            <JobItem
              isCompanyUser={isCompanyUser}
              key={job.id}
              job={job}
              user={user}
              isSuitable={isSuitable}
              isAppliedJobsTabActive={isAppliedJobsTabActive}
              isOnboardingComplete={isOnboardingComplete}
            />
          ))
        )
      ) : (
        <p className="text-muted-foreground mt-20 mx-auto text-center">
          No {isCompanyUser ? "profiles" : "jobs"} found for the selected
          Filter. <br />
          <Link
            href={isCompanyUser ? "/company/profiles" : "/jobs"}
            className="underline"
          >
            Clear Filters
          </Link>
        </p>
      )}

      {jobs.length < totalCount && jobs.length !== 0 && (
        <div ref={loaderRef} className="flex justify-center items-center p-4">
          <AppLoader size="md" />
        </div>
      )}

      <ScrollToTopButton />
    </div>
  );
}
