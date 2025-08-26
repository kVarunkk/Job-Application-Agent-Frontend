"use client";

import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function FindSuitableProfilesForJobPost({
  job_post_id,
}: {
  job_post_id: string;
}) {
  const router = useRouter();

  const handleAiSearch = async (value?: string) => {
    const toastId = toast.loading(
      `AI Smart Search is finding suitable ${"profile"}s according to your ${`Job Posting`}...`
    );

    try {
      const params = new URLSearchParams();
      params.set("sortBy", "relevance");
      if (value) {
        params.set("job_post", value);
      }

      sessionStorage.setItem("ai-toast", toastId);

      router.push(`/${"company/profile"}s?${params.toString()}`);
    } catch {
      toast.error("Some error occured with AI Smart Search, Please try again", {
        id: toastId,
      });
    }
  };

  if (job_post_id) {
    return (
      <Button
        className="rounded-full bg-primary shadow-lg"
        onClick={() => handleAiSearch(job_post_id)}
      >
        <Search className="w-4 h-4" />
        Find Suitable Profiles
      </Button>
    );
  } else return "";
}
