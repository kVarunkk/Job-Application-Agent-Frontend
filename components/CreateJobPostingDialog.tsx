"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Pencil, PlusCircle, Trash } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import MultiLocationSelector from "./MultiLocationSelector";
import { ICreateJobPostingFormData } from "@/lib/types";

const jobFormSchema = z
  .object({
    title: z.string().min(2, {
      message: "Job title must be at least 2 characters.",
    }),
    description: z.string().min(20, {
      message: "Job description must be at least 20 characters.",
    }),
    location: z.array(z.string()).min(1, {
      message:
        "Please select at least one location or select the remote option.",
    }),
    job_type: z.enum(["Fulltime", "Intern", "Contract"], {
      required_error: "Please select a job type.",
    }),
    salary_currency: z.string(),
    min_salary: z.coerce
      .number()
      .min(0, { message: "Must be a positive number." }),
    max_salary: z.coerce.number().min(0, {
      message: "Must be a positive number.",
    }),
    min_experience: z.coerce
      .number()
      .min(0, { message: "Must be a positive number." }),
    max_experience: z.coerce
      .number()
      .min(0, { message: "Must be a positive number." })
      .optional(),
    visa_sponsorship: z.enum(["Required", "Not Required", "Will Sponsor"], {
      required_error: "Please select a visa option.",
    }),
    min_equity: z.coerce.number().min(0).max(100).optional(),
    max_equity: z.coerce.number().min(0).max(100).optional(),
    questions: z
      .array(z.string().min(1, "Question cannot be empty."))
      .max(3, "You can add a maximum of 3 questions.")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.min_salary && data.max_salary) {
        return data.max_salary >= data.min_salary;
      }
      return true;
    },
    {
      message: "Max salary must be greater than or equal to min salary.",
      path: ["max_salary"],
    }
  )
  .refine(
    (data) => {
      if (data.min_experience && data.max_experience) {
        return data.max_experience >= data.min_experience;
      }
      return true;
    },
    {
      message:
        "Max experience must be greater than or equal to min experience.",
      path: ["max_experience"],
    }
  )
  .refine(
    (data) => {
      if (data.min_equity && data.max_equity) {
        return data.max_equity >= data.min_equity;
      }
      return true;
    },
    {
      message: "Max equity must be greater than or equal to min equity.",
      path: ["max_equity"],
    }
  );

export default function CreateJobPostingDialog({
  company_id,
  existingValues,
}: {
  company_id: string;
  existingValues?: ICreateJobPostingFormData & {
    job_id: string | null;
  };
}) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(jobFormSchema),
    defaultValues: existingValues || {
      title: "",
      description: "",
      location: [],
      job_type: undefined,
      salary_currency: "$",
      min_salary: 0,
      max_salary: 0,
      min_experience: 0,
      max_experience: 0,
      visa_sponsorship: "Not Required",
      min_equity: 0,
      max_equity: 0,
      questions: [""],
    },
  });

  useEffect(() => {
    if (existingValues) {
      form.reset(existingValues);
    }
  }, [existingValues, form]);

  const buildSalaryRange = (
    currency?: string,
    salary_min?: number,
    salary_max?: number
  ) => {
    if (currency && salary_min && salary_max) {
      return `${currency}${salary_min} - ${currency}${salary_max}`;
    } else return null;
  };

  const buildEquityRange = (equity_min?: number, equity_max?: number) => {
    if (equity_max && equity_min) {
      return `${equity_min}% - ${equity_max}%`;
    } else if (!equity_max && equity_min) {
      return `${equity_min}% +`;
    } else return null;
  };

  const buildExperience = (exp_min?: number, exp_max?: number) => {
    if (exp_max && exp_min) {
      return `${exp_min} - ${exp_max} Years`;
    } else if (!exp_max && exp_min) {
      return `${exp_min}+ Years`;
    } else return null;
  };

  const onSubmit = async (values: ICreateJobPostingFormData) => {
    setLoading(true);
    const supabase = createClient();
    const salary_range = buildSalaryRange(
      values.salary_currency,
      values.min_salary,
      values.max_salary
    );
    const equity_range = buildEquityRange(values.min_equity, values.max_equity);
    const experience = buildExperience(
      values.min_experience,
      values.max_experience
    );
    try {
      const payload: ICreateJobPostingFormData & {
        salary_range: string | null;
        equity_range: string | null;
        experience: string | null;
        company_id: string;
      } = {
        company_id: company_id,
        ...values,
        salary_range,
        equity_range,
        experience,
        questions: values.questions?.filter((q) => q.trim() !== "") || [],
      };
      if (existingValues && existingValues.id) {
        payload.id = existingValues.id;
      }
      const { data: new_job_posting, error } = await supabase
        .from("job_postings")
        .upsert(payload, {
          onConflict: "id",
        })
        .select("*")
        .single();

      if (error || !new_job_posting) throw error;

      if (existingValues && existingValues.job_id) {
        const { error } = await supabase
          .from("all_jobs")
          .update({
            job_name: payload.title.trim(),
            job_type: payload.job_type,
            salary_range: payload.salary_range,
            salary_min: payload.min_salary,
            salary_max: payload.max_salary,
            experience: payload.experience,
            experience_min: payload.min_experience,
            experience_max: payload.max_experience,
            equity_range: payload.equity_range,
            equity_min: payload.min_equity,
            equity_max: payload.max_equity,
            visa_requirement: payload.visa_sponsorship,
            description: payload.description.trim(),
            locations: payload.location,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingValues.job_id);

        if (error)
          throw new Error(
            "Some error occured while updating the all jobs table"
          );
      } else {
        const { error: updateError } = await supabase
          .from("job_postings")
          .update({ status: "active" })
          .eq("id", new_job_posting.id);

        if (updateError) throw updateError;

        if (!new_job_posting.job_id) {
          // If there's no job_id, this is the first time it's being made active.
          // Insert it into the 'all_jobs' table.
          const { data: insertedData, error: insertError } = await supabase
            .from("all_jobs")
            .insert({
              locations: new_job_posting.location,
              job_type: new_job_posting.job_type,
              job_name: new_job_posting.title,
              description: new_job_posting.description,
              visa_requirement: new_job_posting.visa_sponsorship,
              salary_range: new_job_posting.salary_range,
              salary_min: new_job_posting.min_salary,
              salary_max: new_job_posting.max_salary,
              experience_min: new_job_posting.min_experience,
              experience_max: new_job_posting.max_experience,
              equity_range: new_job_posting.equity_range,
              equity_min: new_job_posting.min_equity,
              equity_max: new_job_posting.max_equity,
              experience: new_job_posting.experience,
              company_url: new_job_posting.company_info?.website,
              company_name: new_job_posting.company_info?.name,
              platform: "gethired",
            })
            .select("id")
            .single();

          if (insertError) throw insertError;

          // Update the job_postings table with the new job_id
          await supabase
            .from("job_postings")
            .update({ job_id: insertedData.id })
            .eq("id", new_job_posting.id);
        }
      }

      toast.success(
        // <div className="flex flex-col">
        //   <span className="font-semibold">
        <>
          {`Job Posting ${
            existingValues ? "updated" : "created"
          } Successfully!`}
        </>,
        // </span>
        // </div>,
        {
          duration: 8000,
        }
      );
      form.reset();
      setIsOpen(false);

      router.refresh();
    } catch (error) {
      console.error("API call failed:", error);
      toast.error(
        `Some error occured while ${
          existingValues ? "updating" : "creating"
        } Job Posting, Please try again`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = async () => {
    const isValid = await form.trigger([
      "title",
      "description",
      "location",
      "job_type",
      "salary_currency",
      "min_salary",
      "max_salary",
      "min_experience",
      "max_experience",
      "visa_sponsorship",
      "min_equity",
      "max_equity",
    ]);

    if (isValid) {
      setStep(2);
    }
  };

  const currentQuestions = form.watch("questions");
  const canAddQuestion = currentQuestions ? currentQuestions.length < 3 : false;

  const jobTypes = ["Fulltime", "Intern", "Contract"];
  const salaryCurrencies = ["₹", "$", "€", "£", "C$", "A$"];
  const visaOptions = ["Will Sponsor", "Not Required", "Required"];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        title={existingValues ? "Edit Job Post" : "Create Job Post"}
        asChild
      >
        {existingValues ? (
          <Button variant={"ghost"} className="text-muted-foreground">
            <Pencil className=" h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <PlusCircle /> Create New Job Post
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex h-[85vh] max-w-xl flex-col overflow-y-hidden">
        <DialogHeader className="h-fit">
          <DialogTitle>
            {existingValues
              ? `Update ${existingValues.title} job post`
              : "Create New Job Post"}
          </DialogTitle>
          <DialogDescription>
            {existingValues
              ? `Fill in the details for ${existingValues.title} job opening`
              : "Fill in the details for your new job opening."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="JobPostingForm"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 h-full overflow-y-auto px-1"
          >
            {step === 1 ? (
              <>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-input"
                          placeholder="Software Engineer"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write a detailed job description..."
                          className="resize-y bg-input h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Locations</FormLabel>
                      <FormControl>
                        <MultiLocationSelector
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="job_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-input">
                              <SelectValue placeholder="Select a job type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {jobTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="visa_sponsorship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visa Sponsorship</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-input">
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {visaOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="salary_currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-input">
                              <SelectValue placeholder="USD" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {salaryCurrencies.map((currency) => (
                              <SelectItem key={currency} value={currency}>
                                {currency}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="min_salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Salary(pa)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="bg-input"
                            placeholder="80000"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="max_salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Salary(pa)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="bg-input"
                            placeholder="120000"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="min_experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Experience (Years)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="bg-input"
                            placeholder="2"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="max_experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Experience (Years)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="bg-input"
                            placeholder="5"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="min_equity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Equity (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="bg-input"
                            placeholder="0.1"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="max_equity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Equity (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="bg-input"
                            placeholder="0.5"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            ) : (
              <>
                <FormLabel>
                  Add up to 3 custom questions for applicants:
                </FormLabel>
                <div className="space-y-4">
                  {currentQuestions &&
                    currentQuestions.map((q, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name={`questions.${index}`}
                          render={({ field }) => (
                            <FormItem className="flex-grow">
                              <FormControl>
                                <Textarea
                                  placeholder={`Question ${index + 1}`}
                                  className="resize-y bg-input"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newQuestions = currentQuestions.filter(
                              (_, i) => i !== index
                            );
                            form.setValue("questions", newQuestions);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  {canAddQuestion && (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          form.setValue("questions", [
                            ...(currentQuestions || []),
                            "",
                          ]);
                        }}
                      >
                        Add Another Question
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </form>

          <DialogFooter className="">
            {step === 2 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
            )}
            {step === 1 && (
              <Button type="button" onClick={handleNextStep}>
                Next
              </Button>
            )}
            {step === 2 && (
              <Button form="JobPostingForm" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {existingValues ? "Updating..." : "Posting..."}
                  </>
                ) : existingValues ? (
                  "Update Job"
                ) : (
                  "Post Job"
                )}
              </Button>
            )}
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
