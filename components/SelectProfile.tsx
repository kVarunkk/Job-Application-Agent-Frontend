"use client";

import { IApplication } from "@/lib/types";
import MultiKeywordSelect, { GenericFormData } from "./MultiKeywordSelect";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

export default function SelectProfile({
  userApplications,
  jobPostings,
  applicantUserId,
}: {
  userApplications?: IApplication[];
  jobPostings?: { id: string; title: string; job_id: string }[];
  applicantUserId?: string;
}) {
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const supabase = createClient();
  useEffect(() => {
    if (userApplications && userApplications.length > 0) {
      const appliedJobTitles = userApplications
        .map((app) => app.job_postings?.title)
        .filter((title): title is string => typeof title === "string");
      setSelectedProfiles(appliedJobTitles);
    }
  }, [userApplications]);

  const handleMultiKeywordSelectChange = useCallback(
    async (name: keyof GenericFormData, keywords: string[]) => {
      const newlySelectedJobTitle = keywords.find(
        (keyword) => !selectedProfiles.includes(keyword)
      );

      if (newlySelectedJobTitle && jobPostings && applicantUserId) {
        const selectedJob = jobPostings?.find(
          (job) => job.title === newlySelectedJobTitle
        );

        if (!selectedJob) {
          toast.error("Job posting not found.");
          return;
        }

        try {
          const { error } = await supabase.from("applications").insert([
            {
              job_post_id: selectedJob.id,
              applicant_user_id: applicantUserId,
              status: "submitted",
              all_jobs_id: selectedJob.job_id,
            },
          ]);

          if (error) {
            throw error;
          }

          setSelectedProfiles((prev) => [...prev, newlySelectedJobTitle]);

          toast.success(
            `Successfully selected candidate for: ${newlySelectedJobTitle}`
          );
        } catch (error) {
          console.error("Error creating application:", error);
          toast.error("Some error occured. Please try again.");

          setSelectedProfiles(selectedProfiles);
        }
      }
    },
    [selectedProfiles, jobPostings, supabase, applicantUserId]
  );

  const availableJobTitles = jobPostings?.map((job) => job.title) || [];

  return (
    <MultiKeywordSelect
      name={"profile"}
      placeholder={"Select Profile"}
      initialKeywords={selectedProfiles}
      onChange={handleMultiKeywordSelectChange}
      className="mt-1 w-full"
      availableItems={availableJobTitles}
      isVirtualized={true}
      showKeywords={false}
    />
  );
}
