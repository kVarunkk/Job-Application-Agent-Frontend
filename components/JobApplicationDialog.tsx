"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useEffect, useMemo, useState } from "react";
import { IJob, TApplicationStatus } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { User } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import PropagationStopper from "./StopPropagation";

const createFormSchema = (questions: string[]) => {
  const schemaFields = questions.reduce<Record<string, z.ZodTypeAny>>(
    (acc, _, index) => {
      acc[`question_${index}`] = z.string().min(1, "Answer cannot be empty.");
      return acc;
    },
    {}
  );

  return z.object(schemaFields);
};

export default function JobApplicationDialog({
  jobPost,
  user,
  isAppliedJobsTabActive,
}: {
  jobPost: IJob;
  user: User | null;
  isAppliedJobsTabActive: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [applicationStatus, setApplicationStatus] =
    useState<TApplicationStatus | null>(null);
  const questions = useMemo(
    () =>
      jobPost.job_postings && jobPost.job_postings.length > 0
        ? jobPost.job_postings[0]?.questions
        : [],
    [jobPost]
  );

  useEffect(() => {
    console.log(applicationStatus);
  }, [applicationStatus]);

  const formSchema = useMemo(() => createFormSchema(questions), [questions]);

  type FormSchemaType = z.infer<typeof formSchema>;

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    (async () => {
      if (isAppliedJobsTabActive) {
        setApplicationStatus(jobPost?.applications?.[0].status ?? null);
      } else {
        if (jobPost.job_postings && jobPost.job_postings.length > 0) {
          jobPost.job_postings[0]?.applications
            ?.filter((each) => each.applicant_user_id === user?.id)
            .forEach((each) => {
              setApplicationStatus(each.status);
            });
        }
      }
    })();
  }, [jobPost, setApplicationStatus, user?.id, isAppliedJobsTabActive]);

  const onSubmit = async (values: Record<string, string>) => {
    setLoading(true);
    const supabase = createClient();

    try {
      if (!user) throw new Error("User is not authenticated.");

      const { data: userData, error: userDataError } = await supabase
        .from("user_info")
        .select("user_id, resume_path")
        .eq("user_id", user.id)
        .single();

      if (userDataError) {
        throw new Error("Failed to fetch user resume information.");
      }

      // --- NEW RESUME HANDLING LOGIC ---
      // 1. Generate a signed URL for the private resume file
      const privateResumePath: string = userData?.resume_path;
      if (!privateResumePath) {
        throw new Error("User has no resume uploaded.");
      }

      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("resumes")
          .createSignedUrl(privateResumePath, 60); // URL valid for 60 seconds

      if (signedUrlError) {
        throw new Error("Failed to generate signed URL for resume.");
      }

      // 2. Download the resume file from the signed URL
      const resumeResponse = await fetch(signedUrlData.signedUrl);
      if (!resumeResponse.ok) {
        throw new Error("Failed to download resume file.");
      }
      const resumeBlob = await resumeResponse.blob();

      // 3. Upload the file to a private, company-specific path in the same bucket
      const privateResumeBucket = "applications";
      const privateResumePathForCompany = `companies/${
        jobPost.job_postings![0].company_id
      }/resumes/${userData.user_id}/${uuidv4()}.pdf`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(privateResumeBucket)
        .upload(privateResumePathForCompany, resumeBlob);

      if (uploadError) {
        throw new Error("Failed to upload resume to private bucket.");
      }

      // The new resume_url is now the private path within the bucket
      const newResumeUrl = uploadData.path;
      // --- END NEW RESUME HANDLING LOGIC ---

      // Combine answers into a JSON object
      const answers = Object.values(values);

      const { error } = await supabase.from("applications").insert({
        job_post_id: jobPost.job_postings![0].id,
        all_jobs_id: jobPost.id,
        applicant_user_id: userData.user_id,
        answers: answers,
        resume_url: newResumeUrl, // Store the private path
        status: "submitted",
      });

      if (error) {
        throw error;
      }

      toast.success("Application submitted successfully!");
      form.reset();
      setIsDialogOpen(false);
      setApplicationStatus("submitted" as TApplicationStatus.SUBMITTED);
    } catch (error) {
      console.error("An error occurred during submission:", error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PropagationStopper>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
        }}
      >
        {applicationStatus ? (
          <Tooltip delayDuration={100}>
            <TooltipTrigger className="cursor-default" asChild>
              <div>
                <Button
                  onClick={(e) => e.stopPropagation()}
                  className="capitalize"
                  disabled={
                    applicationStatus !== null || jobPost.status === "inactive"
                  }
                >
                  {applicationStatus ?? "Apply Now"}{" "}
                  {!applicationStatus && <ArrowRight className=" h-4 w-4" />}
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[200px]">
              Your current application status is <b>{applicationStatus}</b>.
              You&apos;ll be notified via email if the status changes.
            </TooltipContent>
          </Tooltip>
        ) : (
          <DialogTrigger asChild>
            <Button
              // onClick={(e) => e.stopPropagation()}
              className="capitalize"
              disabled={
                applicationStatus !== null || jobPost.status === "inactive"
              }
            >
              {applicationStatus ?? "Apply Now"}{" "}
              {!applicationStatus && <ArrowRight className=" h-4 w-4" />}
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row h-full">
            {/* Left Panel: Company Info */}
            <div className="flex-1 overflow-y-auto p-6 bg-secondary">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  Apply for {jobPost.job_name}
                </DialogTitle>
                <DialogDescription>at {jobPost.company_name}</DialogDescription>
              </DialogHeader>
              {/* <Separator className="my-4" /> */}
              <div className="space-y-4 mt-5">
                <Card className="shadow-none border">
                  <CardHeader>
                    <CardTitle className="text-lg">Company Profile</CardTitle>
                    {jobPost.company_url && (
                      <CardDescription>{jobPost.company_url}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm ">
                      {jobPost.job_postings && jobPost.job_postings.length > 0
                        ? jobPost.job_postings[0].company_info?.description
                        : "No description provided."}
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-none border">
                  <CardHeader>
                    <CardTitle className="text-lg">Job Details</CardTitle>
                    <CardDescription className="text-sm font-medium">
                      {jobPost.job_type} | {jobPost.locations.join(", ")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm  whitespace-pre-wrap">
                      {jobPost.description || "No description provided."}
                    </p>
                    {jobPost.salary_range && (
                      <div>
                        <p className="font-semibold text-sm">Salary Range</p>
                        <p className="text-sm ">{jobPost.salary_range}</p>
                      </div>
                    )}
                    {jobPost.experience && (
                      <div>
                        <p className="font-semibold text-sm">Experience</p>
                        <p className="text-sm ">{jobPost.experience}</p>
                      </div>
                    )}
                    {jobPost.visa_requirement && (
                      <div>
                        <p className="font-semibold text-sm">
                          Visa Requirement
                        </p>
                        <p className="text-sm ">{jobPost.visa_requirement}</p>
                      </div>
                    )}
                    {jobPost.equity_range && (
                      <div>
                        <p className="font-semibold text-sm">Equity</p>
                        <p className="text-sm ">{jobPost.equity_range}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                {/* You can add more company details here */}
              </div>
            </div>

            {/* Right Panel: Application Form */}
            <div className="flex-1 overflow-y-auto p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold">Your Answers</h3>
                  {questions.length > 0 ? (
                    questions.map((question, index) => (
                      <FormField
                        key={index}
                        control={form.control}
                        name={`question_${index}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{question}</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Type your answer here..."
                                className="resize-y bg-input  h-[200px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      This job does not have any custom questions.
                    </p>
                  )}

                  <div className="flex justify-end mt-6">
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PropagationStopper>
  );
}
