"use client";

import { Loader2, Trash } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteJobPosting({
  job_posting_id,
  is_job_posting_page = false,
}: {
  job_posting_id: string;
  is_job_posting_page?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleDelete = async () => {
    const supabase = createClient();
    try {
      setLoading(true);
      const { data: jobPosting, error: fetchError } = await supabase
        .from("job_postings")
        .select("job_id")
        .eq("id", job_posting_id)
        .single();

      if (fetchError || !jobPosting) {
        throw new Error("Failed to fetch job posting details.");
      }

      // If a job_id exists, delete the corresponding record from 'all_jobs' first
      if (jobPosting.job_id) {
        const { error: allJobsDeleteError } = await supabase
          .from("all_jobs")
          .delete()
          .eq("id", jobPosting.job_id);

        if (allJobsDeleteError) {
          throw new Error("Failed to delete record from 'all_jobs' table.");
        }
      }

      // Now, delete the record from 'job_postings'
      const { error: jobPostingsDeleteError } = await supabase
        .from("job_postings")
        .delete()
        .eq("id", job_posting_id);

      if (jobPostingsDeleteError) {
        throw new Error("Failed to delete record from 'job_postings' table.");
      }

      toast.success("Job posting deleted successfully.");

      if (is_job_posting_page) {
        router.push("/company");
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete job posting."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"ghost"} className="text-muted-foreground">
          <Trash className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Job Posting</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this job posting? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleDelete}
            disabled={loading}
            variant={"destructive"}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
