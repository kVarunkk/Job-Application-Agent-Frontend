"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
  FormEvent,
  useState,
  ChangeEvent,
  useEffect,
  useTransition,
  SetStateAction,
  Dispatch,
  useCallback,
  useMemo,
} from "react";
import { Button } from "./ui/button";
import AppLoader from "./AppLoader";

import MultiKeywordSelect, { GenericFormData } from "./MultiKeywordSelect";
import MultiKeywordSelectInput from "./MultiKeywordSelectInput";
import InputFilter from "./InputFilterComponent";

type FilterConfig = {
  name: keyof FiltersState;
  label: string;
  type: "text" | "number" | "multi-select" | "multi-select-input"; // Removed 'select' type
  placeholder?: string;
  options?: { value: string; label: string }[]; // Options for multi-select (for availableItems prop)
};

// Define the type for the component's state
export type FiltersState = {
  jobType: string[];
  location: string[];
  visaRequirement: string[];
  minSalary: string;
  minExperience: string;
  platform: string[];
  company_name: string[];
  jobTitleKeywords: string[];
  jobRole: string[];
  industryPreference: string[];
  workStylePreference: string[];
  skills: string[];
  maxSalary?: string;
};

export default function FilterComponent({
  uniqueLocations,
  uniqueCompanies,
  setOpenSheet,
  uniqueJobRoles,
  uniqueIndustryPreferences,
  uniqueWorkStylePreferences,
  uniqueSkills,
  isProfilesPage = false,
}: {
  uniqueLocations: { location: string }[];
  uniqueCompanies?: { company_name: string }[];
  setOpenSheet?: Dispatch<SetStateAction<boolean>>;
  uniqueJobRoles?: { job_role: string }[];
  uniqueIndustryPreferences?: { industry_preference: string }[];
  uniqueWorkStylePreferences?: { work_style_preference: string }[];
  uniqueSkills?: { skill: string }[];
  isProfilesPage?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  // Define FILTER_CONFIG with 'multi-select' types for all relevant fields
  const FILTER_CONFIG: FilterConfig[] = useMemo(() => {
    return isProfilesPage
      ? [
          {
            name: "jobType",
            label: "Job Type",
            type: "multi-select", // Changed to multi-select
            placeholder: "Select the type of Job",
            options: [
              { value: "Fulltime", label: "Full Time" },
              { value: "Intern", label: "Internship" },
              { value: "Contract", label: "Contract" },
              // 'all' is handled by the absence of the parameter in the URL
            ],
          },
          {
            name: "jobRole",
            label: "Job Role",
            type: "multi-select", // Changed to multi-select
            placeholder: "Select the Job Role",
            options: uniqueJobRoles?.map((each) => ({
              value: each.job_role,
              label: each.job_role,
            })),
          },
          {
            name: "industryPreference",
            label: "Industry Preference",
            type: "multi-select", // Changed to multi-select
            placeholder: "Select the Industry Preference",
            options: uniqueIndustryPreferences?.map((each) => ({
              value: each.industry_preference,
              label: each.industry_preference,
            })),
          },
          {
            name: "workStylePreference",
            label: "Work Style Preference",
            type: "multi-select", // Changed to multi-select
            placeholder: "Select the Work Style Preference",
            options: uniqueWorkStylePreferences?.map((each) => ({
              value: each.work_style_preference,
              label: each.work_style_preference,
            })),
          },
          {
            name: "skills",
            label: "Skills",
            type: "multi-select", // Changed to multi-select
            placeholder: "Select the Skills",
            options: uniqueSkills?.map((each) => ({
              value: each.skill,
              label: each.skill,
            })),
          },
          {
            name: "location",
            label: "Location",
            type: "multi-select", // Changed to multi-select
            placeholder: "Select the location of Job",

            options: uniqueLocations.map((each) => ({
              value: each.location,
              label: each.location,
            })),
          },

          {
            name: "maxSalary",
            label: "Maximum Salary",
            type: "number",
            placeholder: "e.g., 80000",
          },
          {
            name: "minExperience",
            label: "Minimum Experience (years)",
            type: "number",
            placeholder: "e.g., 2",
          },
        ]
      : [
          {
            name: "jobType",
            label: "Job Type",
            type: "multi-select", // Changed to multi-select
            placeholder: "Select the type of Job",
            options: [
              { value: "Fulltime", label: "Full Time" },
              { value: "Intern", label: "Internship" },
              { value: "Contract", label: "Contract" },
              // 'all' is handled by the absence of the parameter in the URL
            ],
          },
          {
            name: "location",
            label: "Location",
            type: "multi-select", // Changed to multi-select
            placeholder: "Select the location of Job",

            options: uniqueLocations.map((each) => ({
              value: each.location,
              label: each.location,
            })),
          },
          {
            name: "visaRequirement",
            label: "Visa Requirement",
            type: "multi-select", // Changed to multi-select
            placeholder: "Select the Visa configuration",

            options: [
              {
                value: "US Citizenship/Visa Not Required",
                label: "US Citizenship/Visa Not Required",
              },
              { value: "Will Sponsor", label: "Will Sponsor" },
              { value: "US Citizen/Visa Only", label: "US Citizen/Visa Only" },
            ],
          },

          {
            name: "company_name",
            label: "Company",
            type: "multi-select", // Changed to multi-select
            placeholder: "Select the company",

            options: uniqueCompanies?.map((each) => ({
              value: each.company_name,
              label: each.company_name,
            })),
          },
          {
            name: "platform",
            label: "Platform",
            type: "multi-select", // Changed to multi-select
            placeholder: "Select the platform",

            options: [
              { value: "remoteok", label: "Remote Ok" },
              { value: "uplers", label: "Uplers" },
              { value: "ycombinator", label: "YCombinator" },
            ],
          },
          {
            name: "jobTitleKeywords",
            label: "Job Title Keywords",
            type: "multi-select-input", // Use multi-select for this
            placeholder: "Type or select from dropdown",
            options: [
              // Provide a list of common job title keywords for the dropdown
              // You can import this from a constants file if you have one
              { value: "Engineer", label: "Engineer" },
              { value: "Developer", label: "Developer" },
              { value: "Manager", label: "Manager" },
              { value: "Analyst", label: "Analyst" },
              { value: "Lead", label: "Lead" },
              { value: "Senior", label: "Senior" },
              { value: "Junior", label: "Junior" },
              { value: "Director", label: "Director" },
              { value: "Architect", label: "Architect" },
              { value: "Specialist", label: "Specialist" },
              // ... add more common keywords as needed
            ],
          },
          {
            name: "minSalary",
            label: "Minimum Salary",
            type: "number",
            placeholder: "e.g., 80000",
          },
          {
            name: "minExperience",
            label: "Minimum Experience (years)",
            type: "number",
            placeholder: "e.g., 2",
          },
        ];
  }, [
    uniqueCompanies,
    uniqueLocations,
    uniqueJobRoles,
    uniqueIndustryPreferences,
    uniqueWorkStylePreferences,
    uniqueSkills,
    isProfilesPage,
  ]);

  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");

  // Initialize state from URL search params or default to empty arrays/strings
  const getInitialState = useCallback((): FiltersState => {
    const initialState: Partial<FiltersState> = {};
    FILTER_CONFIG.forEach((filter) => {
      const paramValue = searchParams.get(filter.name);
      if (
        filter.type === "multi-select" ||
        filter.type === "multi-select-input"
      ) {
        // For multi-select, parse comma-separated string into an array
        (initialState[filter.name] as string[]) = paramValue
          ? paramValue
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : []; // Default to empty array if no param or param is empty
      } else {
        // For text/number, keep as string or default to empty string
        (initialState[filter.name] as string) = paramValue || "";
      }
    });
    return initialState as FiltersState;
  }, [FILTER_CONFIG, searchParams]);

  const [filters, setFilters] = useState<FiltersState>(getInitialState());

  useEffect(() => {
    setFilters(getInitialState());
  }, [getInitialState]); // Depend on searchParams to re-initialize state

  // A single handler for input changes (for type="text" or "number")
  const handleChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement> // Only for Input elements
    ) => {
      const { name, value } = e.target;
      setFilters((prevFilters) => ({
        ...prevFilters,
        [name as keyof FiltersState]: value,
      }));
    },
    [setFilters]
  );

  // Handler for MultiKeywordInput changes (it will pass name and string[])
  const handleMultiKeywordSelectChange = useCallback(
    (name: keyof GenericFormData, keywords: string[]) => {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [name]: keywords,
      }));
    },
    [setFilters]
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();

    // Iterate over the state object to build query params
    for (const [key, value] of Object.entries(filters)) {
      const filterConfig = FILTER_CONFIG.find((config) => config.name === key);

      if (
        filterConfig?.type === "multi-select" ||
        filterConfig?.type === "multi-select-input"
      ) {
        // For multi-selects, join the array with commas if not empty
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(","));
        }
      } else {
        // For text/number inputs, set if value is not empty
        if (value && value !== "") {
          params.set(key, value as string);
        }
      }
    }

    // Always include sortBy and sortOrder if they exist in the URL
    if (sortBy) {
      params.set("sortBy", sortBy);
    }
    if (sortOrder) {
      params.set("sortOrder", sortOrder);
    }
    // Reset page to 1 whenever filters are applied
    // params.set("page", "1");

    if (setOpenSheet) setOpenSheet(false);

    startTransition(() => {
      router.push(
        `/${isProfilesPage ? "company/profiles" : "jobs"}?${params.toString()}`
      );
    });
  };

  const inputFilterOnChange = useCallback(
    (name: string, value: string | string[] | undefined) =>
      handleChange({
        target: { name, value },
      } as ChangeEvent<HTMLInputElement>),
    [handleChange]
  );

  const renderInput = (config: FilterConfig) => {
    switch (config.type) {
      case "multi-select":
        return (
          <MultiKeywordSelect
            name={config.name}
            placeholder={config.placeholder}
            initialKeywords={filters[config.name] as string[]}
            onChange={handleMultiKeywordSelectChange}
            className="mt-1 w-full"
            availableItems={config.options?.map((e) => e.value)}
          />
        );
      case "multi-select-input":
        return (
          <MultiKeywordSelectInput
            name={config.name}
            placeholder={config.placeholder}
            initialKeywords={filters[config.name] as string[]}
            onChange={handleMultiKeywordSelectChange}
            className="mt-1 w-full"
            availableItems={config.options?.map((e) => e.value)}
          />
        );
      case "number":
      case "text":
        return (
          <InputFilter
            name={String(config.name)}
            type={config.type}
            placeholder={config.placeholder}
            value={filters[config.name]}
            onChange={inputFilterOnChange}
            className="block w-full mt-1 bg-input"
            min={config.type === "number" ? 0 : undefined}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-start py-4 ">
      <form className="w-full" onSubmit={handleSubmit}>
        {FILTER_CONFIG.map((config) => (
          <label
            key={config.name}
            htmlFor={String(config.name)}
            className="block mb-4"
          >
            <span className="font-medium">{config.label}:</span>
            {renderInput(config)}
          </label>
        ))}
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="underline"
            onClick={() => {
              // Clear all filters, but preserve sort if it exists
              const params = new URLSearchParams();
              if (sortBy) params.set("sortBy", sortBy);
              if (sortOrder) params.set("sortOrder", sortOrder);
              if (setOpenSheet) setOpenSheet(false);
              startTransition(() => {
                router.push(
                  `/${
                    isProfilesPage ? "company/profiles" : "jobs"
                  }?${params.toString()}`
                );
              });
            }}
          >
            Clear Filters
          </button>

          <Button type="submit" disabled={isPending}>
            Apply Filters
            {isPending && <AppLoader size="sm" color="secondary" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
