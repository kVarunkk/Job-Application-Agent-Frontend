"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import MultiKeywordInput from "./MultiKeywordInput";
import { createClient } from "@/lib/supabase/client";
import { IFormValues } from "./CreateWorkflowForm";
import { v4 as uuidv4 } from "uuid";
import InfoTooltip from "./InfoTooltip";
import { FormField } from "./FormField";
import { IWorkflow } from "@/lib/types";

interface WorkflowSheetConfigFormProps {
  workflow: IWorkflow;
  fetchWorkflow: () => Promise<void>;
}

export default function WorkflowSheetConfigForm({
  workflow,
  fetchWorkflow,
}: WorkflowSheetConfigFormProps) {
  const [formValues, setFormValues] = useState<IFormValues>({
    no_jobs: workflow.no_jobs,
    interval: workflow.interval,
    auto_apply: workflow.auto_apply,
    included_keywords: workflow.required_keywords,
    excluded_keywords: workflow.excluded_keywords,
    title_included_keywords: workflow.job_title_contains,
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const updateFormValues = (
    type: keyof Pick<
      IFormValues,
      "included_keywords" | "excluded_keywords" | "title_included_keywords"
    >,
    keywords: {
      id: string;
      content: string;
    }[]
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [type]: keywords.map((each) => each.content),
    }));
  };

  const updateWorkflow = async () => {
    try {
      setLoading(true);
      if (
        typeof formValues.no_jobs !== "number" ||
        !formValues.no_jobs ||
        !formValues.interval
      )
        throw new Error("Issue with FormValues");

      const { data, error } = await supabase
        .from("workflows")
        .update({
          no_jobs: formValues.no_jobs,
          required_keywords: formValues.included_keywords ?? [],
          excluded_keywords: formValues.excluded_keywords ?? [],
          job_title_contains: formValues.title_included_keywords ?? [],
          interval: formValues.interval,
          auto_apply: formValues.auto_apply,
        })
        .eq("id", workflow.id);

      if (error) throw error;

      fetchWorkflow();
    } catch (error) {
      console.error("Some error occured while creating Workflow");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Scrollable container for form fields */}
      <div
        className="flex flex-col gap-4 w-full overflow-y-auto pr-1"
        style={{ maxHeight: "calc(100vh - 17rem)" }}
      >
        {/* Number of Jobs */}
        <FormField label="Number of Jobs to scrape/apply to" htmlFor="no_jobs">
          <Input
            id="no_jobs"
            name="no_jobs"
            type="number"
            min={1}
            max={5}
            placeholder="e.g. 5"
            required
            value={formValues.no_jobs}
            onChange={(e) => {
              const value = Number(e.target.value);
              setFormValues((prev) => ({
                ...prev,
                no_jobs: value >= 1 && value <= 5 ? value : 1,
              }));
            }}
          />
        </FormField>

        {/* Keywords to Include */}
        <FormField
          label="Keywords to include"
          htmlFor="included_keywords"
          tooltip="If any of these keywords match with the Job Description, it will be considered fit for further evaluations."
        >
          <MultiKeywordInput
            type="included_keywords"
            placeholder="e.g. Python"
            updateFormValues={updateFormValues}
            initialKeywords={formValues.included_keywords.map((kw) => ({
              id: uuidv4(),
              content: kw,
            }))}
          />
        </FormField>

        {/* Keywords to Exclude */}
        <FormField
          label="Keywords to exclude"
          htmlFor="excluded_keywords"
          tooltip="If any of these keywords match with the Job Description, it will be considered unfit for further evaluations."
        >
          <MultiKeywordInput
            type="excluded_keywords"
            placeholder="e.g. Docker"
            updateFormValues={updateFormValues}
            initialKeywords={formValues.excluded_keywords.map((kw) => ({
              id: uuidv4(),
              content: kw,
            }))}
          />
        </FormField>

        {/* Title Keywords */}
        <FormField
          label="Job Title keywords to include"
          htmlFor="title_included_keywords"
          tooltip="If any of these keywords match with the Job Title, it will be considered fit for further evaluations."
        >
          <MultiKeywordInput
            type="title_included_keywords"
            placeholder="e.g. Founding Engineer"
            updateFormValues={updateFormValues}
            initialKeywords={formValues.title_included_keywords.map((kw) => ({
              id: uuidv4(),
              content: kw,
            }))}
          />
        </FormField>

        {/* CRON Interval */}
        <FormField
          label="Interval"
          htmlFor="interval"
          tooltip="The Workflow will be scheduled to run according to this CRON interval"
        >
          <Input
            id="interval"
            name="interval"
            placeholder="e.g. 0 8 * * *"
            required
            value={formValues.interval}
            onChange={(e) =>
              setFormValues((prev) => ({
                ...prev,
                interval: e.target.value,
              }))
            }
          />
        </FormField>

        {/* Auto Apply */}
        <FormField
          label="Auto Apply"
          htmlFor="auto_apply"
          tooltip="All the Suitable Jobs would be Applied to if this option is set to True else the suitable jobs will be stored for you to apply to later"
        >
          <Switch
            checked={formValues.auto_apply}
            onCheckedChange={(value) =>
              setFormValues((prev) => ({
                ...prev,
                auto_apply: value,
              }))
            }
          />
        </FormField>
      </div>

      {/* Submit Button */}
      <Button onClick={updateWorkflow} disabled={loading}>
        {loading ? "Updating..." : "Update Workflow"}
      </Button>
    </div>
  );
}
