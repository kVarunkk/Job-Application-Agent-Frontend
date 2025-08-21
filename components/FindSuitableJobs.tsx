"use client";

import {
  Dispatch,
  SetStateAction,
  startTransition,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { PlusCircle, Search, Sparkle } from "lucide-react";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IJobPost } from "./JobPostingsTable";
import { SelectGroup } from "@radix-ui/react-select";
import Link from "next/link";

export default function FindSuitableJobs({
  user,
  setPage,
  isProfilesPage,
  companyId,
}: {
  user: User | null;
  setPage: Dispatch<SetStateAction<number>>;
  isProfilesPage: boolean;
  companyId?: string;
}) {
  const [suitableJobsSelectValue, setSuitableJobsSelectValue] = useState("");
  const [jobPostings, setJobPostings] = useState<IJobPost[]>([]);
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();

  const findCompanyUsersJobPostings = useCallback(async (): Promise<
    IJobPost[]
  > => {
    const { data, error } = await supabase
      .from("job_postings")
      .select("*")
      .eq("company_id", companyId);
    if (data && !error) {
      return data;
    } else return [];
  }, [supabase, companyId]);

  useEffect(() => {
    (async () => {
      const job_postings = await findCompanyUsersJobPostings();
      if (job_postings.length > 0) {
        setJobPostings(job_postings);
      }
    })();
  }, [findCompanyUsersJobPostings]);

  useEffect(() => {
    const toastId = sessionStorage.getItem("ai-toast");

    if (typeof window !== "undefined" && toastId) {
      toast.success(
        `Found suitable ${isProfilesPage ? "Profiles" : "Jobs"} for you`,
        {
          id: toastId,
        }
      );
      sessionStorage.removeItem("ai-toast");
    }
  }, [isProfilesPage]);

  const handleFindSuitableJobs = async () => {
    const toastId = toast.loading("Finding suitable jobs..."); // Show loading toast

    try {
      if (!user) throw new Error("User not found");
      // 2. Fetch user_info
      const { data: userInfo, error: userInfoError } = await supabase
        .from("user_info")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (userInfoError && userInfoError.code !== "PGRST116") {
        // PGRST116 means no rows found
        console.error("Error fetching user info:", userInfoError);
        toast.error("Failed to load your profile. Please try again.", {
          id: toastId,
        });
        return;
      }

      if (!userInfo) {
        toast.error("Please complete your profile first.", { id: toastId });
        router.push("/get-started"); // Redirect to onboarding
        return;
      }

      // 3. Construct URLSearchParams based on user_info
      const params = new URLSearchParams();

      // Preserve current sort order if it exists
      const currentSortBy = searchParams.get("sortBy");
      const currentSortOrder = searchParams.get("sortOrder");
      if (currentSortBy && currentSortBy !== "vector_similarity")
        params.set("sortBy", currentSortBy);
      if (currentSortOrder) params.set("sortOrder", currentSortOrder);

      const addMultiParam = (paramName: string, values: string[] | null) => {
        if (values && values.length > 0) {
          params.set(paramName, values.join(","));
        }
      };

      addMultiParam("jobTitleKeywords", userInfo.desired_roles);
      addMultiParam("location", userInfo.preferred_locations);
      addMultiParam("jobType", userInfo.job_type);
      addMultiParam(
        "visaRequirement",
        userInfo.visa_sponsorship_required
          ? ["Will Sponsor"]
          : ["US Citizenship/Visa Not Required", "US Citizen/Visa Only"]
      );

      if (userInfo.min_salary) {
        params.set("minSalary", userInfo.min_salary.toString());
      }
      if (userInfo.experience_years) {
        params.set("minExperience", userInfo.experience_years.toString());
      }

      startTransition(() => {
        router.push(`/jobs?${params.toString()}`);
        toast.success("Filters applied based on your profile!", {
          id: toastId,
        });
      });
    } catch (error: unknown) {
      console.error("Error in handleFindSuitableJobs:", error);
      toast.error(
        `An unexpected error occurred: ${
          error instanceof Error ? error.message : "Please try again."
        }`,
        { id: toastId }
      );
    }
  };

  const handleAiSearch = async (value?: string) => {
    const toastId = toast.loading(
      `AI Smart Search is finding suitable ${
        isProfilesPage ? "profile" : "job"
      }s according to your ${isProfilesPage ? `Job Posting` : "profile"}...`
    );

    try {
      const params = new URLSearchParams();
      params.set("sortBy", "vector_similarity");
      if (value) {
        params.set("job_post", value);
      }
      setPage(() => 1);

      sessionStorage.setItem("ai-toast", toastId);

      router.push(
        `/${isProfilesPage ? "company/profile" : "job"}s?${params.toString()}`
      );
    } catch {
      toast.error("Some error occured with AI Smart Search, Please try again", {
        id: toastId,
      });
    }
  };

  if (isProfilesPage && companyId) {
    return (
      <Select
        value={suitableJobsSelectValue}
        onValueChange={(value) => {
          setSuitableJobsSelectValue(value);
          handleAiSearch(value);
          setTimeout(() => setSuitableJobsSelectValue(""), 100);
        }}
      >
        <SelectTrigger className="rounded-full bg-primary shadow-lg w-[200px]">
          <SelectValue
            placeholder={
              <p className="flex items-center gap-2 text-primary-foreground">
                <Search className="w-4 h-4" /> Find Suitable Profiles
              </p>
            }
          />
        </SelectTrigger>
        <SelectGroup>
          <SelectContent>
            <SelectLabel className="flex items-center text-sm justify-between gap-4 w-[200px]">
              <div className="flex flex-col gap-1">
                <p>Select a Job Posting</p>
                <p className="text-xs text-muted-foreground">
                  Suitable Profiles will be found according to the selected job
                  post
                </p>
              </div>
              <Link href={"/company/job-posts"}>
                <PlusCircle className="h-4 w-4" />
              </Link>
            </SelectLabel>
            <SelectSeparator />
            {jobPostings.map((each) => (
              <SelectItem key={each.id} value={each.id}>
                {each.title}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectGroup>
      </Select>
    );
  }

  return (
    <Select
      value={suitableJobsSelectValue}
      onValueChange={(value) => {
        setSuitableJobsSelectValue(value);
        if (value === "find-suitable") {
          handleFindSuitableJobs();
        }
        if (value === "ai-job-search") {
          handleAiSearch();
        }
        setTimeout(() => setSuitableJobsSelectValue(""), 100);
      }}
    >
      <SelectTrigger className="rounded-full bg-primary shadow-lg w-[180px]">
        <SelectValue
          placeholder={
            <p className="flex items-center gap-2 text-primary-foreground">
              <Search className="w-4 h-4" /> Find Suitable Jobs
            </p>
          }
        />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="find-suitable">
          Find Jobs Matching My Profile
        </SelectItem>
        <SelectItem value="ai-job-search">
          <div className="w-full flex items-center gap-2">
            <Sparkle className="h-4 w-4" />
            AI Smart Search
          </div>
        </SelectItem>
        {/* You could add more options here if needed, e.g., "Reset to default" */}
      </SelectContent>
    </Select>
  );
}
