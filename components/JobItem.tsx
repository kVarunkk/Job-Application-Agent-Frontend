"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight, Dot, Star } from "lucide-react";
import { Badge } from "./ui/badge";
import { IJob } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import JobApplicationDialog from "./JobApplicationDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import toast from "react-hot-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { InfoCircledIcon } from "@radix-ui/react-icons";

export default function JobItem({
  job,
  user,
  isSuitable,
  isCompanyUser,
  activeCardID,
  setActiveCardID,
  isAppliedJobsTabActive,
}: {
  job: IJob;
  user: User | null;
  isSuitable: boolean;
  isCompanyUser: boolean;
  activeCardID?: string;
  setActiveCardID: Dispatch<SetStateAction<string | undefined>>;
  isAppliedJobsTabActive: boolean;
}) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isDialogOpenState, setIsDialogOpenState] = useState(false);
  const supabase = createClient();
  const [isFavorite, setIsFavorite] = useState(
    job.user_favorites?.filter((each) => each.user_id === user?.id).length > 0
  );
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const isActive = activeCardID === job.id;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouchDevice("ontouchstart" in window);
    }
  }, []);

  const handleToggleDescription = useCallback(() => {
    if (isActive) {
      setActiveCardID(undefined);
    } else {
      setActiveCardID(job.id);
    }
  }, [isActive, job.id, setActiveCardID]);

  const handleFavorite = async (job: IJob) => {
    try {
      let query;

      if (
        job.user_favorites?.filter((each) => each.user_id === user?.id).length >
        0
      ) {
        query = supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", user?.id)
          .eq("job_id", job.id);
      } else
        query = supabase.from("user_favorites").insert([
          {
            user_id: user?.id,
            job_id: job.id,
          },
        ]);

      const { error } = await query;

      if (error) throw new Error(error.details);
    } catch (e) {
      console.error(e);
    }
  };

  const dialogStateCallback = useCallback(
    (state: boolean) => {
      setIsDialogOpenState(state);
    },
    [setIsDialogOpenState]
  );

  useEffect(() => {
    console.log(isDialogOpenState);
  }, [isDialogOpenState]);

  const handleJobApplicationStatus = () => {
    setShowReturnDialog(true);
  };

  const handleCloseDialog = useCallback(() => {
    setShowReturnDialog(false);
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 group  rounded-lg transition ",
        isActive ? "bg-secondary" : ""
      )}
      onMouseEnter={() => {
        if (!isDialogOpenState || !isTouchDevice || !showReturnDialog)
          setActiveCardID(job.id);
      }}
      onMouseLeave={() => {
        if (!isDialogOpenState || !isTouchDevice || !showReturnDialog)
          setActiveCardID(undefined);
      }}
      onClick={() => {
        if ((!isDialogOpenState || !showReturnDialog) && isTouchDevice)
          handleToggleDescription();
      }}
      tabIndex={0} // Makes div focusable for accessibility
      role="button"
      //   aria-pressed={showDescription}
    >
      <div className="flex-col sm:flex-row sm:flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2 mb-6 sm:mb-0">
          <div className="flex items-center flex-wrap">
            <h3 className="text-lg sm:text-xl font-semibold">{job.job_name}</h3>
            <Dot />
            <p className="text-muted-foreground">{job.company_name}</p>
            {isCompanyUser ? (
              ""
            ) : user ? (
              <button
                onClick={() => {
                  setIsFavorite(!isFavorite);
                  handleFavorite(job);
                }}
                className="ml-3"
              >
                <Star
                  //   fill={isFavorite ? 'white' : "transparent"}
                  className={`${
                    isFavorite && "fill-black dark:fill-white"
                  } h-5 w-5`}
                />
              </button>
            ) : (
              <Link href={"/auth/sign-up"} className="ml-3">
                <Star className="h-5 w-5" />
              </Link>
            )}
          </div>
          <JobDetailBadges
            job={job}
            showDescription={isActive}
            isSuitable={isSuitable}
          />
        </div>
        {isCompanyUser ? (
          ""
        ) : user ? (
          job.job_url ? (
            job.applications && job.applications.length > 0 ? (
              <Tooltip delayDuration={100}>
                <TooltipTrigger className="cursor-default" asChild>
                  <div>
                    <Button className="capitalize" disabled>
                      {job.applications[0].status}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px]">
                  Your current application status is{" "}
                  <b>{job.applications[0].status}</b>. You&apos;ll have to
                  manually track your application status via the{" "}
                  <Link className="underline text-blue-600" href={job.job_url}>
                    Job Posting
                  </Link>
                  .
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                href={job.job_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button onClick={handleJobApplicationStatus}>
                  Apply Now <ArrowRight />
                </Button>
              </Link>
            )
          ) : (
            <JobApplicationDialog
              dialogStateCallback={dialogStateCallback}
              jobPost={job}
              user={user}
              isAppliedJobsTabActive={isAppliedJobsTabActive}
            />
          )
        ) : (
          <Link href={"/auth/sign-up"} rel="noopener noreferrer">
            <Button>
              Apply Now <ArrowRight />
            </Button>
          </Link>
        )}
      </div>
      {job.status === "inactive" && (
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          <InfoCircledIcon />
          This Job Posting has been deactivated by {job.company_name}
        </div>
      )}
      <div
        className={`transition-all duration-300 ease-in-out overflow-y-auto ${
          isActive ? "max-h-96 opacity-100 py-2" : "max-h-0 opacity-0"
        }`}
      >
        <div className="whitespace-pre-wrap">
          {job.description && job.description}...{" "}
          {job.job_url && (
            <Link href={job.job_url} target="_blank" className="underline">
              Read more
            </Link>
          )}
        </div>
      </div>
      <JobStatusDialog
        job={job}
        showDialog={showReturnDialog}
        onClose={handleCloseDialog}
        userId={user?.id}
      />
    </div>
  );
}

function JobStatusDialog({
  job,
  showDialog,
  onClose,
  userId,
}: {
  job: IJob;
  showDialog: boolean;
  onClose: () => void;
  userId?: string;
}) {
  const updateJobApplicationStatus = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("applications").insert({
        applicant_user_id: userId,
        status: "submitted",
        all_jobs_id: job.id,
      });
      if (error) throw error;

      onClose();
    } catch (e) {
      console.error(e);
      toast.error(
        "Some error occured while updating the application status. Please try again."
      );
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Did you apply for the role of {job.job_name} at {job.company_name}?
          </DialogTitle>
          <DialogDescription>
            This helps us track your application status.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant={"secondary"} onClick={onClose}>
            No
          </Button>
          <Button onClick={updateJobApplicationStatus}>Yes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function JobDetailBadges({
  job,
  showDescription,
  isSuitable,
}: {
  job: IJob;
  showDescription: boolean;
  isSuitable: boolean;
}) {
  const jobDetails = [
    {
      id: "job_type",
      value: job.job_type,
      label: "Job Type",
    },
    {
      id: "salary_range",
      value: job.salary_range,
      label: "Salary Range",
    },
    {
      id: "experience",
      value: job.experience,
      label: "Experience",
    },
    {
      id: "visa_requirement",
      value: job.visa_requirement,
      label: "Visa Requirement",
    },
    {
      id: "locations",
      value: job.locations.join(", "),
      label: "Locations",
    },
    {
      id: "equity_range",
      value: job.equity_range,
      label: "Equity Range",
    },
  ];

  let platform_url;

  switch (job.platform) {
    case "ycombinator":
      platform_url = "https://www.workatastartup.com/companies";
      break;
    case "uplers":
      platform_url = "https://ats.uplers.com/talent/all-opportunities";
      break;
    case "remoteok":
      platform_url = "https://remoteok.com";
      break;
    default:
      platform_url = "";
      break;
  }
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {jobDetails
        .filter((each) => each.value)
        .map((detail) => (
          <Badge
            variant={"outline"}
            key={detail.id}
            className={cn(
              "text-xs sm:text-sm font-medium ",
              showDescription ? "border-secondary-foreground" : ""
            )}
          >
            {detail.value}
          </Badge>
        ))}
      {job.platform && (
        <Link href={platform_url || ""} target="_blank">
          <Badge
            variant={"secondary"}
            className={cn(
              "text-xs sm:text-sm font-medium hover:!text-secondary-foreground ",
              showDescription
                ? "border-secondary-foreground bg-primary text-primary-foreground"
                : ""
            )}
          >
            {job.platform}
          </Badge>
        </Link>
      )}
      {isSuitable && (
        <Badge
          className={cn(
            "text-xs sm:text-sm font-medium bg-green-200 text-green-700 !border-green-200 hover:bg-green-100",
            showDescription ? "border-secondary-foreground" : ""
          )}
        >
          Job Match
        </Badge>
      )}
    </div>
  );
}
