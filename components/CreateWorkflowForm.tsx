"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import MultiKeywordInput from "./MultiKeywordInput";
import { createClient } from "@/lib/supabase/client";
import { FormField } from "./FormField";
import { Agent, IFormData } from "@/lib/types";
import { FiltersState } from "./FilterComponent";

export interface IFormValues {
  no_jobs: number;
  interval: string;
  auto_apply: boolean;
  included_keywords: string[];
  excluded_keywords: string[];
  title_included_keywords: string[];
}

interface CreateWorkflowFormProps {
  agent: Agent;
  closeDialog: () => void;
}

export default function CreateWorkflowForm({
  agent,
  closeDialog,
}: CreateWorkflowFormProps) {
  const [formValues, setFormValues] = useState<IFormValues>({
    no_jobs: 1,
    interval: "0 8 * * *",
    auto_apply: false,
    included_keywords: [],
    excluded_keywords: [],
    title_included_keywords: [],
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const updateFormValues = (
    type:
      | keyof Pick<
          IFormValues,
          "included_keywords" | "excluded_keywords" | "title_included_keywords"
        >
      | keyof IFormData
      | keyof FiltersState,
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

  const createWorkflow = async () => {
    try {
      setLoading(true);
      if (
        typeof formValues.no_jobs !== "number" ||
        !formValues.no_jobs ||
        !formValues.interval
      )
        throw new Error("Issue with FormValues");

      const { error } = await supabase.from("workflows").insert([
        {
          no_jobs: formValues.no_jobs,
          required_keywords: formValues.included_keywords ?? [],
          excluded_keywords: formValues.excluded_keywords ?? [],
          job_title_contains: formValues.title_included_keywords ?? [],
          interval: formValues.interval,
          auto_apply: formValues.auto_apply ?? false,
          agent_id: agent.id,
          user_id: agent.user_id,
        },
      ]);

      if (error) throw error;

      closeDialog();
    } catch {
      console.error("Some error occured while creating Workflow");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-md max-h-full">
      <div
        className="flex flex-col gap-4 w-full overflow-y-auto pr-1"
        style={{ maxHeight: "calc(70vh - 15rem)" }}
      >
        <FormField label="Number of Jobs to scrape/apply to" htmlFor="no_jobs">
          <Input
            id="no_jobs"
            name="no_jobs"
            placeholder="e.g. 5"
            type="number"
            min={1}
            max={5}
            required
            value={formValues.no_jobs}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 1 && value <= 5) {
                setFormValues((prev) => ({
                  ...prev,
                  no_jobs: value,
                }));
              } else if (e.target.value === "") {
                setFormValues((prev) => ({
                  ...prev,
                  no_jobs: 1,
                }));
              }
            }}
          />
        </FormField>
        <FormField
          label="Keywords to include"
          htmlFor="included_keywords"
          tooltip="If any of these keywords match with the Job Description, it will be considered fit for further evaluations."
        >
          <MultiKeywordInput
            type={"included_keywords"}
            updateFormValues={updateFormValues}
            placeholder="e.g. Python"
          />
        </FormField>

        <FormField
          label="Keywords to exclude"
          htmlFor="excluded_keywords"
          tooltip="If any of these keywords match with the Job Description, it will be considered unfit for further evaluations."
        >
          <MultiKeywordInput
            type="excluded_keywords"
            updateFormValues={updateFormValues}
            placeholder="e.g. Docker"
          />
        </FormField>

        <FormField
          label="Job Title keywords to include"
          htmlFor="title_included_keywords"
          tooltip="If any of these keywords match with the Job Title, it will be considered fit for further evaluations."
        >
          <MultiKeywordInput
            type="title_included_keywords"
            updateFormValues={updateFormValues}
            placeholder="e.g. Founding Engineer"
          />
        </FormField>

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

        {agent.platforms?.auto_apply_available && (
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
        )}
      </div>

      <Button onClick={createWorkflow} disabled={loading}>
        {loading ? "Creating..." : "Create Workflow"}
      </Button>
    </div>
  );
}
