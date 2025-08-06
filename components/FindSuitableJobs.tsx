"use client";

import {
  Dispatch,
  SetStateAction,
  startTransition,
  useEffect,
  useState,
} from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Search, Sparkle } from "lucide-react";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function FindSuitableJobs({
  user,
  setPage,
}: {
  user: User | null;
  setPage: Dispatch<SetStateAction<number>>;
}) {
  const [suitableJobsSelectValue, setSuitableJobsSelectValue] = useState("");
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();

  useEffect(() => {
    const toastId = sessionStorage.getItem("ai-toast");

    if (typeof window !== "undefined" && toastId) {
      toast.success("Found suitable Jobs for you", {
        id: toastId,
      });
      sessionStorage.removeItem("ai-toast");
    }
  }, []);

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

  const handleAiSearch = async () => {
    const toastId = toast.loading("Smart is finding suitable jobs...");

    try {
      const params = new URLSearchParams();
      params.set("sortBy", "vector_similarity");
      setPage(() => 1);

      sessionStorage.setItem("ai-toast", toastId);

      router.push(`/jobs?${params.toString()}`);
    } catch {
      toast.error("Smart search failed", { id: toastId });
    }
  };

  return (
    <Select
      value={suitableJobsSelectValue}
      onValueChange={(value) => {
        setSuitableJobsSelectValue(value); // Update local state for Select
        if (value === "find-suitable") {
          handleFindSuitableJobs(); // Call the function
        }
        if (value === "ai-job-search") {
          handleAiSearch();
        }
        setTimeout(() => setSuitableJobsSelectValue(""), 100); // Reset after a short delay
      }}
    >
      <SelectTrigger
        // Distinctive styling for the trigger
        className="rounded-full bg-primary shadow-lg w-[180px]"
      >
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
            Smart Search
          </div>
        </SelectItem>
        {/* You could add more options here if needed, e.g., "Reset to default" */}
      </SelectContent>
    </Select>
  );
}
