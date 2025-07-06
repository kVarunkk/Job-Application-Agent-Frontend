"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import MultiKeywordInput from "./MultiKeywordInput";

export interface IFormValues {
  no_jobs: number;
  interval: string;
  auto_apply: boolean;
  included_keywords: string[];
  excluded_keywords: string[];
  title_included_keywords: string[];
}

export default function CreateWorkflowForm() {
  const [formValues, setFormValues] = useState<IFormValues>({
    no_jobs: 1,
    interval: "0 8 * * *",
    auto_apply: false,
    included_keywords: [],
    excluded_keywords: [],
    title_included_keywords: [],
  });
  const [loading, setLoading] = useState(false);

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
      [type]: keywords,
    }));
  };

  const createWorkflow = async () => {
    if (
      typeof formValues.no_jobs !== "number" ||
      !formValues.no_jobs ||
      !formValues.interval
    )
      return;

    console.log(formValues);
  };

  return (
    <div className="flex flex-col gap-4 max-w-md max-h-full">
      <div
        className="flex flex-col gap-4 w-full overflow-y-auto pr-1"
        style={{ maxHeight: "calc(70vh - 15rem)" }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="no_jobs">Number of Jobs to scrape/apply to</Label>
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
          {/* <p className="text-sm text-red-500">{errors.name && errors.name}</p> */}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="included_keywords">Keywords to include</Label>
          <MultiKeywordInput
            type={"included_keywords"}
            updateFormValues={updateFormValues}
            placeholder="e.g. Python"
          />
          {/* <p className="text-sm text-red-500">{errors.name && errors.name}</p> */}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="excluded_keywords">Keywords to exclude</Label>
          <MultiKeywordInput
            type="excluded_keywords"
            updateFormValues={updateFormValues}
            placeholder="e.g. Docker"
          />
          {/* <p className="text-sm text-red-500">{errors.name && errors.name}</p> */}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="title_included_keywords">
            Job Title keywords to include
          </Label>
          <MultiKeywordInput
            type="title_included_keywords"
            updateFormValues={updateFormValues}
            placeholder="e.g. Founding Engineer"
          />
          {/* <p className="text-sm text-red-500">{errors.name && errors.name}</p> */}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="interval">Interval</Label>
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
          {/* <p className="text-sm text-red-500">{errors.name && errors.name}</p> */}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="auto_apply">Auto Apply</Label>
          <Switch
            checked={formValues.auto_apply}
            onCheckedChange={(value) =>
              setFormValues((prev) => ({
                ...prev,
                auto_apply: value,
              }))
            }
          />
          {/* <p className="text-sm text-red-500">{errors.name && errors.name}</p> */}
        </div>
      </div>

      <Button onClick={createWorkflow} disabled={loading}>
        {loading ? "Creating..." : "Create Workflow"}
      </Button>
    </div>
  );
}
