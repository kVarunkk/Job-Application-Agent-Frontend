"use client";

import { Trash } from "lucide-react";
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

export default function DeleteJobPosting({
  job_posting_id,
  is_job_posting_page = false,
}: {
  job_posting_id: string;
  is_job_posting_page?: boolean;
}) {
  const router = useRouter();
  const handleDelete = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from("job_postings")
      .delete()
      .eq("id", job_posting_id);
    if (error) {
      toast.error("Failed to delete job posting.");
    } else {
      toast.success("Job posting deleted successfully.");
      if (is_job_posting_page) {
        router.push("/company");
      } else {
        router.refresh();
      }
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
          <Button onClick={handleDelete} variant={"destructive"}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
