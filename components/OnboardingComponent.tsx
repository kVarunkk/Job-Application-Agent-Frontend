"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid"; // For generating unique file names
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import {
  cn,
  commonIndustries,
  commonJobTitles,
  commonSkills,
  commonWorkStyles,
} from "@/lib/utils";
import { IFormData } from "@/lib/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import MultiKeywordSelectInput from "./MultiKeywordSelectInput";
import MultiKeywordSelect from "./MultiKeywordSelect";
import { User } from "@supabase/supabase-js";
import ResumePreviewDialog from "./ResumePreviewDialog";
import { Loader2, X } from "lucide-react";
import UserOnboardingPersonalization from "./UserOnboardingPersonalization";
import { useCachedFetch } from "@/lib/hooks/useCachedFetch";

// --- Step Components ---

interface StepProps {
  formData: IFormData;
  setFormData: React.Dispatch<React.SetStateAction<IFormData>>;
  errors: Partial<Record<keyof IFormData, string>>;
  setErrors: React.Dispatch<
    React.SetStateAction<Partial<Record<keyof IFormData, string>>>
  >;
  loadingLocations?: boolean;
}

const Step1JobRole = ({ formData, setFormData, errors }: StepProps) => {
  return (
    <CardContent className="flex flex-col gap-4 !p-0">
      <div>
        <Label htmlFor="full_name">Full Name</Label>
        <Input
          id="full_name"
          type="text"
          placeholder="e.g., John Doe"
          value={formData.full_name ?? ""}
          onChange={(e) =>
            setFormData({ ...formData, full_name: e.target.value })
          }
          className={cn(
            "mt-2 bg-input",
            errors.full_name ? "border-red-500" : ""
          )}
        />

        {errors.full_name && (
          <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
        )}
      </div>
      <div>
        <Label htmlFor="desired_roles">Desired Job Titles / Roles</Label>

        <div className="mt-2">
          <MultiKeywordSelectInput
            name="desired_roles"
            label="Desired Job Titles / Roles" // Using the new label prop
            placeholder="Type or select from dropdown"
            initialKeywords={formData.desired_roles ?? []}
            onChange={(name, keywords) =>
              setFormData((prev) => ({ ...prev, [name]: keywords }))
            }
            availableItems={commonJobTitles}
            className={cn(errors.desired_roles ? "border-red-500" : "")}
          />
        </div>

        {errors.desired_roles && (
          <p className="text-red-500 text-sm mt-1">{errors.desired_roles}</p>
        )}
      </div>

      <div>
        <Label htmlFor="job_type">What type of job are you looking for?</Label>

        <MultiKeywordSelect
          name={"job_type"}
          placeholder="e.g., Fulltime, Intern"
          initialKeywords={formData.job_type ?? []}
          onChange={(name, keywords) => {
            setFormData({
              ...formData,
              [name]: keywords,
            });
          }}
          className={cn("mt-2 ", errors.job_type ? "border-red-500" : "")}
          availableItems={["Fulltime", "Intern", "Contract"]}
        />

        {errors.job_type && (
          <p className="text-red-500 text-sm mt-1">{errors.job_type}</p>
        )}
      </div>
    </CardContent>
  );
};

const Step2LocationSalary: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
  loadingLocations,
}) => (
  <CardContent className="flex flex-col gap-4 !p-0">
    <div>
      <Label htmlFor="preferred_locations">Preferred Locations</Label>

      <div className="mt-2">
        <MultiKeywordSelect
          name="preferred_locations"
          placeholder="Select preferred locations"
          initialKeywords={formData.preferred_locations ?? []}
          onChange={(name, keywords) =>
            setFormData((prev) => ({ ...prev, [name]: keywords }))
          }
          availableItems={formData.default_locations}
          isVirtualized={true}
          loading={loadingLocations}
          className={cn(errors.preferred_locations ? "border-red-500" : "")}
        />
      </div>

      {errors.preferred_locations && (
        <p className="text-red-500 text-sm mt-1">
          {errors.preferred_locations}
        </p>
      )}
    </div>

    <div>
      <Label htmlFor="min_salary" className="mt-4">
        Minimum Salary per annum
      </Label>
      <div className="flex items-center gap-2">
        <Select
          value={formData.salary_currency ?? "$"}
          onValueChange={(value) =>
            setFormData({ ...formData, salary_currency: value })
          }
        >
          <SelectTrigger className="bg-input mt-2 w-[80px]">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="₹">₹</SelectItem>
            <SelectItem value="$">$</SelectItem>
            <SelectItem value="€">€</SelectItem>
            <SelectItem value="£">£</SelectItem>
            <SelectItem value="C$">C$</SelectItem>
            <SelectItem value="A$">A$</SelectItem>
          </SelectContent>
        </Select>
        <Input
          id="min_salary"
          type="number"
          placeholder="e.g., 60000"
          value={formData.min_salary}
          onChange={(e) =>
            setFormData({
              ...formData,
              min_salary: e.target.value === "" ? "" : parseInt(e.target.value),
            })
          }
          className={cn(
            "mt-2 bg-input",
            errors.min_salary ? "border-red-500 " : ""
          )}
        />
      </div>
      {errors.min_salary && (
        <p className="text-red-500 text-sm mt-1">{errors.min_salary}</p>
      )}
    </div>

    <div>
      <Label htmlFor="max_salary" className="mt-4">
        Maximum Salary per annum (Optional)
      </Label>
      <div className="flex items-center gap-2">
        <Select
          value={formData.salary_currency ?? "$"}
          onValueChange={(value) =>
            setFormData({ ...formData, salary_currency: value })
          }
        >
          <SelectTrigger className="bg-input mt-2  w-[80px]">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="₹">₹</SelectItem>
            <SelectItem value="$">$</SelectItem>
            <SelectItem value="€">€</SelectItem>
            <SelectItem value="£">£</SelectItem>
            <SelectItem value="C$">C$</SelectItem>
            <SelectItem value="A$">A$</SelectItem>
          </SelectContent>
        </Select>{" "}
        <Input
          id="max_salary"
          type="number"
          placeholder="e.g., 90000"
          value={formData.max_salary}
          onChange={(e) =>
            setFormData({
              ...formData,
              max_salary: e.target.value === "" ? "" : parseInt(e.target.value),
            })
          }
          className={cn(
            "mt-2 bg-input",
            errors.max_salary ? "border-red-500 " : ""
          )}
        />
      </div>

      {errors.max_salary && (
        <p className="text-red-500 text-sm mt-1">{errors.max_salary}</p>
      )}
    </div>
  </CardContent>
);

const Step3SkillsExperience: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
}) => (
  <CardContent className="flex flex-col gap-4 !p-0">
    <div>
      <Label htmlFor="experience_years">Years of Professional Experience</Label>
      <Input
        id="experience_years"
        type="number"
        placeholder="e.g., 5"
        value={formData.experience_years}
        onChange={(e) =>
          setFormData({
            ...formData,
            experience_years:
              e.target.value === "" ? "" : parseInt(e.target.value),
          })
        }
        className={cn(
          "mt-2 bg-input",
          errors.experience_years ? "border-red-500 " : ""
        )}
      />
      {errors.experience_years && (
        <p className="text-red-500 text-sm mt-1">{errors.experience_years}</p>
      )}
    </div>

    <div>
      <Label htmlFor="top_skills" className="mt-4">
        Top 5-10 Skills
      </Label>

      <div className="mt-2">
        <MultiKeywordSelectInput
          name="top_skills"
          placeholder="Type or select from dropdown"
          initialKeywords={formData.top_skills ?? []}
          onChange={(name, keywords) =>
            setFormData((prev) => ({ ...prev, [name]: keywords }))
          }
          availableItems={commonSkills}
          className={cn(errors.top_skills ? "border-red-500" : "")}
        />
      </div>

      {errors.top_skills && (
        <p className="text-red-500 text-sm mt-1">{errors.top_skills}</p>
      )}
    </div>
  </CardContent>
);

const Step4VisaWorkStyle: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
}) => (
  <CardContent className="flex flex-col gap-4 !p-0">
    <div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="visa_sponsorship_required"
          checked={formData.visa_sponsorship_required}
          onCheckedChange={(checked) =>
            setFormData({
              ...formData,
              visa_sponsorship_required: checked as boolean,
            })
          }
          className={errors.visa_sponsorship_required ? "border-red-500" : ""}
        />
        <Label>Do you require Visa Sponsorship?</Label>
      </div>

      {errors.visa_sponsorship_required && (
        <p className="text-red-500 text-sm mt-1">
          {errors.visa_sponsorship_required}
        </p>
      )}
    </div>

    <div>
      <Label htmlFor="industry_preferences" className="mt-4">
        Industry Preferences
      </Label>

      <div className="mt-2">
        <MultiKeywordSelectInput
          name="industry_preferences"
          placeholder="Type or select from dropdown"
          initialKeywords={formData.industry_preferences ?? []}
          onChange={(name, keywords) =>
            setFormData((prev) => ({ ...prev, [name]: keywords }))
          }
          availableItems={commonIndustries}
          className={cn(errors.industry_preferences ? "border-red-500" : "")}
        />
      </div>

      {errors.industry_preferences && (
        <p className="text-red-500 text-sm mt-1">
          {errors.industry_preferences}
        </p>
      )}
    </div>

    <div>
      <Label htmlFor="work_style_preferences" className="mt-4">
        Preferred Work Styles
      </Label>

      <div className="mt-2">
        <MultiKeywordSelectInput
          name="work_style_preferences"
          placeholder="Type or select from dropdown"
          initialKeywords={formData.work_style_preferences ?? []}
          onChange={(name, keywords) =>
            setFormData((prev) => ({ ...prev, [name]: keywords }))
          }
          availableItems={commonWorkStyles}
          className={cn(errors.work_style_preferences ? "border-red-500" : "")}
        />
      </div>

      {errors.work_style_preferences && (
        <p className="text-red-500 text-sm mt-1">
          {errors.work_style_preferences}
        </p>
      )}
    </div>
  </CardContent>
);

const Step5CareerGoals: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
}) => (
  <CardContent className="flex flex-col gap-4 !p-0">
    <div>
      <Label htmlFor="career_goals_short_term">
        Short-term Career Goals (1-2 years)
      </Label>
      <Textarea
        id="career_goals_short_term"
        placeholder="e.g., Land a senior software engineering role focusing on AI."
        value={formData.career_goals_short_term ?? ""}
        onChange={(e) =>
          setFormData({ ...formData, career_goals_short_term: e.target.value })
        }
        className={cn(
          "mt-2 bg-input",
          errors.career_goals_short_term ? "border-red-500 " : ""
        )}
      />
      {errors.career_goals_short_term && (
        <p className="text-red-500 text-sm mt-1">
          {errors.career_goals_short_term}
        </p>
      )}
    </div>

    <div>
      <Label htmlFor="career_goals_long_term" className="mt-4">
        Long-term Career Goals (3-5 years)
      </Label>
      <Textarea
        id="career_goals_long_term"
        placeholder="e.g., Become a tech lead or start my own AI-driven company."
        value={formData.career_goals_long_term}
        onChange={(e) =>
          setFormData({ ...formData, career_goals_long_term: e.target.value })
        }
        className={cn(
          "mt-2 bg-input",
          errors.career_goals_long_term ? "border-red-500 " : ""
        )}
      />
      {errors.career_goals_long_term && (
        <p className="text-red-500 text-sm mt-1">
          {errors.career_goals_long_term}
        </p>
      )}
    </div>

    <div>
      <Label htmlFor="company_size_preference" className="mt-4">
        Preferred Company Size
      </Label>
      <Select
        onValueChange={(value) =>
          setFormData({ ...formData, company_size_preference: value })
        }
        value={formData.company_size_preference}
      >
        <SelectTrigger className="mt-2 bg-input">
          <SelectValue
            placeholder="Select company size"
            className={cn(
              errors.company_size_preference ? "border-red-500 " : ""
            )}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Small (1-50)">Small (1-50 employees)</SelectItem>
          <SelectItem value="Medium (51-500)">
            Medium (51-500 employees)
          </SelectItem>
          <SelectItem value="Large (500+)">Large (500+ employees)</SelectItem>
          <SelectItem value="Any">Any Size</SelectItem>
        </SelectContent>
      </Select>
      {errors.company_size_preference && (
        <p className="text-red-500 text-sm mt-1">
          {errors.company_size_preference}
        </p>
      )}
    </div>
  </CardContent>
);

const Step6ResumeUpload: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  // State for the signed URL to display
  const [signedDisplayUrl, setSignedDisplayUrl] = useState<string | null>(null);
  const [signedUrlError, setSignedUrlError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // State for the local file preview URL (for newly selected files before upload)
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  // --- Effect to generate signed URL ---
  useEffect(() => {
    const fetchSignedUrl = async () => {
      // Only fetch if resume_url exists (meaning it was previously uploaded and stored)
      if (formData.resume_path) {
        setSignedUrlError(null);
        setSignedDisplayUrl(null); // Clear previous URL

        try {
          const supabase = createClient();

          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (user === null || userError) {
            setSignedUrlError(
              `Failed to load resume: ${userError ? userError.message : ""}`
            );
          }

          const { data, error } = await supabase.storage
            .from("resumes")
            .createSignedUrl(`${formData.resume_path}`, 3600); // URL valid for 1 hour

          if (error) {
            setSignedUrlError(`Failed to load resume: ${error.message}`);
          } else if (data?.signedUrl) {
            setSignedDisplayUrl(data.signedUrl);
          } else {
            setSignedUrlError("Could not get signed URL for resume.");
          }
        } catch (err: unknown) {
          setSignedUrlError(
            `An unexpected error occurred: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        } finally {
          setLoading(false);
        }
      } else {
        // If formData.resume_url is null, clear any previous signed URL
        setSignedDisplayUrl(null);
        setSignedUrlError(null);
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [formData.resume_path]); // Re-run when the Supabase URL changes

  // --- Effect to generate local preview URL for newly selected files ---
  useEffect(() => {
    if (formData.resume_file) {
      // Create a URL for the local file object
      const url = URL.createObjectURL(formData.resume_file);
      setLocalPreviewUrl(url);

      // Clean up the object URL when the component unmounts or the file changes
      return () => URL.revokeObjectURL(url);
    } else {
      setLocalPreviewUrl(null);
    }
  }, [formData.resume_file]); // Re-run when the selected file changes

  return (
    <CardContent className="!p-0">
      <Label htmlFor="resume_file">Upload Your Resume (PDF, DOCX)</Label>
      <Input
        id="resume_file"
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => {
          const file = e.target.files ? e.target.files[0] : null;
          setFormData((prev) => ({
            ...prev,
            resume_file: file, // Store the File object
            resume_name: file ? file.name : null, // Update resume_name immediately
          }));
        }}
        className={cn(
          "mt-2 bg-input",
          errors.resume_file ? "border-red-500 " : ""
        )}
      />
      {errors.resume_file && (
        <p className="text-red-500 text-sm mt-1">{errors.resume_file}</p>
      )}

      {formData.resume_file && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground mt-2">
            Selected file: {formData.resume_file.name}
          </p>

          <button
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                resume_file: null,
                resume_name: null,
              }));
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading && <Loader2 className="animate-spin h-4 w-4 mt-2" />}

      {formData.resume_path && signedDisplayUrl && !signedUrlError && (
        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
          <ResumePreviewDialog
            displayUrl={signedDisplayUrl}
            isPdf={signedDisplayUrl.endsWith(".pdf")}
          />
          your currently stored Resume
        </p>
      )}

      {signedUrlError && (
        <p className="text-red-500 text-sm mt-2">{signedUrlError}</p>
      )}

      {formData.resume_file && localPreviewUrl && (
        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
          <ResumePreviewDialog
            displayUrl={localPreviewUrl}
            isPdf={localPreviewUrl.endsWith(".pdf")}
          />
          for the Resume you just uploaded
        </p>
      )}
    </CardContent>
  );
};

const Step7ReviewSubmit: React.FC<StepProps> = ({ formData }) => (
  <CardContent className="!p-0">
    <h3 className="text-lg font-semibold mb-4">Review Your Information</h3>

    {/* Section 1: Job & Location Preferences */}
    <div className={cn(" p-4 rounded-md border border-border mb-4")}>
      <h4 className="font-semibold  mb-2">Job & Location Preferences</h4>
      <div className="space-y-1 text-sm ">
        <p>
          <span>Full Name:</span> {formData.full_name || "N/A"}
        </p>
        <p>
          <span>Desired Roles:</span>{" "}
          {formData.desired_roles.join(", ") || "N/A"}
        </p>
        <p>
          <span>Preferred Locations:</span>{" "}
          {formData.preferred_locations.join(", ") || "N/A"}
        </p>
        <p>
          <span>Salary Range:</span> {formData.min_salary || "N/A"}
          {formData.salary_currency} - {formData.max_salary || "N/A"}
          {formData.salary_currency}
        </p>
      </div>
    </div>

    {/* Section 2: Experience & Skills */}
    <div className={cn(" p-4 rounded-md border border-border mb-4")}>
      <h4 className="font-semibold  mb-2">Experience & Skills</h4>
      <div className="space-y-1 text-sm ">
        <p>
          <span>Years of Experience:</span> {formData.experience_years || "N/A"}
        </p>
        <p>
          <span>Top Skills:</span> {formData.top_skills.join(", ") || "N/A"}
        </p>
      </div>
    </div>

    {/* Section 3: Work & Company Preferences */}
    <div className={cn(" p-4 rounded-md border border-border mb-4")}>
      <h4 className="font-semibold  mb-2">Work & Company Preferences</h4>
      <div className="space-y-1 text-sm ">
        <p>
          <span>Visa Sponsorship Required:</span>{" "}
          {formData.visa_sponsorship_required ? "Yes" : "No"}
        </p>
        <p>
          <span>Industry Preferences:</span>{" "}
          {formData.industry_preferences.join(", ") || "N/A"}
        </p>
        <p>
          <span>Work Style Preferences:</span>{" "}
          {formData.work_style_preferences.join(", ") || "N/A"}
        </p>
        <p>
          <span>Company Size Preference:</span>{" "}
          {formData.company_size_preference || "N/A"}
        </p>
      </div>
    </div>

    {/* Section 4: Career Goals */}
    <div className={cn(" p-4 rounded-md border border-border mb-4")}>
      <h4 className="font-semibold  mb-2">Career Goals</h4>
      <div className="space-y-1 text-sm ">
        <p>
          <span>Short-term Goals:</span>{" "}
          {formData.career_goals_short_term || "N/A"}
        </p>
        <p>
          <span>Long-term Goals:</span>{" "}
          {formData.career_goals_long_term || "N/A"}
        </p>
      </div>
    </div>

    {/* Section 5: Resume */}
    <div className={cn(" p-4 rounded-md border border-border")}>
      <h4 className="font-semibold  mb-2">Resume</h4>
      <div className="space-y-1 text-sm ">
        <p>
          <span>Resume File:</span>{" "}
          {formData.resume_path ? "Stored" : "Not Stored"}
        </p>
      </div>
    </div>
  </CardContent>
);

// --- Main Onboarding Form Component ---
export const OnboardingForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<IFormData>({
    full_name: "",
    desired_roles: [],
    preferred_locations: [],
    salary_currency: "$",
    min_salary: "",
    max_salary: "",
    experience_years: "",
    industry_preferences: [],
    visa_sponsorship_required: false,
    top_skills: [],
    work_style_preferences: [],
    career_goals_short_term: "",
    career_goals_long_term: "",
    company_size_preference: "",
    resume_file: null,
    resume_url: null,
    resume_path: null,
    resume_name: null,
    default_locations: [],
    job_type: [],
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof IFormData, string>>
  >({});
  const [user, setUser] = useState<User | null>(null);
  const [initialPreferencesState, setInitialPreferencesState] = useState<{
    id: string;
    is_promotion_active: boolean;
    is_job_digest_active: boolean;
  } | null>(null);
  const { data: countries, isLoading: isLoadingLocations } = useCachedFetch<
    { location: string }[]
  >("countryData", "/api/locations", undefined, true);
  const router = useRouter();
  const steps = useMemo(() => {
    return [
      {
        name: "Job Role",
        component: Step1JobRole,
        fields: ["full_name", "desired_roles", "job_type"],
      },
      {
        name: "Location & Salary",
        component: Step2LocationSalary,
        fields: [
          "preferred_locations",
          "min_salary",
          "max_salary",
          "salary_currency",
        ],
      },
      {
        name: "Experience & Skills",
        component: Step3SkillsExperience,
        fields: ["experience_years", "top_skills"],
      },
      {
        name: "Visa & Work Style",
        component: Step4VisaWorkStyle,
        fields: ["industry_preferences", "work_style_preferences"],
      },
      {
        name: "Career Goals",
        component: Step5CareerGoals,
        fields: [
          "career_goals_short_term",
          "career_goals_long_term",
          "company_size_preference",
        ],
      },
      {
        name: "Resume Upload",
        component: Step6ResumeUpload,
        fields: ["resume_file"],
      },
      { name: "Review", component: Step7ReviewSubmit, fields: [] },
    ];
  }, []);

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Fetch current user on component mount and try to load existing data
  useEffect(() => {
    const fetchUserAndData = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Try to load existing user info
        const { data, error } = await supabase
          .from("user_info")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (data) {
          setInitialPreferencesState(() => ({
            id: data.user_id,
            is_promotion_active: data.is_promotion_active,
            is_job_digest_active: data.is_job_digest_active,
          }));
          setFormData((prev) => ({
            ...prev,
            ...data,
            min_salary: data.min_salary || "", // Handle null/undefined from DB
            max_salary: data.max_salary || "",
            experience_years: data.experience_years || "",
            // Resume file is not loaded from DB, only URL
            resume_file: null,
            default_locations:
              !isLoadingLocations && countries
                ? countries.map((each: { location: string }) => each.location)
                : [],
          }));
        } else if (error && error.code !== "PGRST116") {
          // PGRST116 means "no rows found"
          setError(`Failed to load user data: ${error.message}`);
        }
      } else {
        // Handle case where user is not logged in, e.g., redirect to login
        setError("User not logged in. Please log in to complete onboarding.");
      }
    };

    fetchUserAndData();
  }, [countries, isLoading]); // Run once on mount

  // Validation function for current step
  const validateStep = useCallback(() => {
    const currentStepFields = steps[currentStep].fields;
    const newErrors: Partial<Record<keyof IFormData, string>> = {};
    let isValid = true;

    currentStepFields.forEach((field) => {
      const value = formData[field as keyof IFormData];

      switch (field) {
        case "full_name":
          if (!value || (value as string).trim() === "") {
            newErrors[field] = "Full name is required.";
            isValid = false;
          }
          break;
        case "desired_roles":
          if (((value as string[]) ?? []).length === 0) {
            newErrors[field] = "Please select atleast one role.";
            isValid = false;
          }
          break;
        case "job_type":
          if (((value as string[]) ?? []).length === 0) {
            newErrors[field] = "Please select atleast one type.";
            isValid = false;
          }
          break;
        case "salary_currency":
          if (!value) {
            newErrors[field] = "Please select a salary currency.";
            isValid = false;
          }
          break;
        case "preferred_locations":
          if (((value as string[]) ?? []).length === 0) {
            newErrors[field] = "Please select atleast one location.";
            isValid = false;
          }
          break;
        case "top_skills":
          if (((value as string[]) ?? []).length === 0) {
            newErrors[field] = "Please select atleast one skill.";
            isValid = false;
          }
          break;
        case "industry_preferences":
        case "work_style_preferences":
          if (((value as string[]) ?? []).length === 0) {
            newErrors[field] = "This field is required.";
            isValid = false;
          }
          break;
        case "min_salary":
        case "experience_years":
          if (typeof value !== "number" || isNaN(value) || value < 0) {
            newErrors[field] = "Please enter a valid positive number.";
            isValid = false;
          }
          break;
        case "max_salary":
          if (
            value !== "" &&
            (typeof value !== "number" || isNaN(value) || value < 0)
          ) {
            newErrors[field] =
              "Please enter a valid positive number or leave empty.";
            isValid = false;
          } else if (
            typeof formData.min_salary === "number" &&
            typeof value === "number" &&
            value < formData.min_salary
          ) {
            newErrors[field] = "Max salary cannot be less than min salary.";
            isValid = false;
          }
          break;
        case "career_goals_short_term":
        case "career_goals_long_term":
        case "company_size_preference":
          if (!value) {
            newErrors[field] = "This field is required.";
            isValid = false;
          }
          break;
        case "resume_file":
          // Only validate if it's the resume upload step and no URL exists yet
          if (
            currentStep ===
              steps.findIndex((s) => s.name === "Resume Upload") &&
            !formData.resume_name &&
            !formData.resume_path
          ) {
            newErrors[field] = "Please upload your resume.";
            isValid = false;
          }
          break;
        // visa_sponsorship_required is a boolean, no specific validation needed here unless it's a required choice
      }
    });

    setFormErrors(newErrors);
    return isValid;
  }, [formData, currentStep, steps]);

  const handleNext = async () => {
    setError(null);
    // setSuccessMessage(null);

    if (!validateStep()) {
      return;
    }

    // Special handling for resume upload step
    if (steps[currentStep].name === "Resume Upload" && formData.resume_file) {
      setIsLoading(true);
      try {
        if (!user) {
          setError("User not authenticated for resume upload.");
          setIsLoading(false);
          return;
        }

        const file = formData.resume_file;
        const fileExt = file.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`; // Unique file name
        const filePath = `resumes/${user.id}/${fileName}`; // Store in user's folder

        const supabase = createClient();

        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true, // Allow overwriting if file path is the same (e.g., user re-uploads)
          });

        if (uploadError) {
          setError(`Resume upload failed: ${uploadError.message}`);
          setIsLoading(false);
          return;
        }

        setFormData((prev) => ({
          ...prev,
          resume_path: filePath,
          resume_name: file.name,
        }));
      } catch (uploadException: unknown) {
        setError(
          `An unexpected error occurred during resume upload: ${
            uploadException instanceof Error
              ? uploadException.message
              : String(uploadException)
          }`
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setError(null);
    // setSuccessMessage(null);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    // setSuccessMessage(null);
    setIsLoading(true);

    if (!user) {
      setError("User not authenticated. Please log in.");
      setIsLoading(false);
      return;
    }

    try {
      // Prepare data for Supabase upsert
      const dataToSave = {
        user_id: user.id,
        email: user.email,
        desired_roles: formData.desired_roles,
        full_name: formData.full_name,
        preferred_locations: formData.preferred_locations,
        salary_currency: formData.salary_currency || "$",
        min_salary: formData.min_salary === "" ? null : formData.min_salary,
        max_salary: formData.max_salary === "" ? null : formData.max_salary,
        experience_years:
          formData.experience_years === "" ? null : formData.experience_years,
        industry_preferences: formData.industry_preferences,
        visa_sponsorship_required: formData.visa_sponsorship_required,
        top_skills: formData.top_skills,
        work_style_preferences: formData.work_style_preferences,
        career_goals_short_term: formData.career_goals_short_term,
        career_goals_long_term: formData.career_goals_long_term,
        company_size_preference: formData.company_size_preference,
        resume_name: formData.resume_name,
        resume_path: formData.resume_path,
        job_type: formData.job_type,
        filled: true,
      };
      const supabase = createClient();

      const res = await fetch("/api/update-embedding/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          desired_roles: formData.desired_roles,
          preferred_locations: formData.preferred_locations,
          min_salary: formData.min_salary || 0,
          max_salary: formData.max_salary || 0,
          experience_years: formData.experience_years || 0,
          industry_preferences: formData.industry_preferences,
          visa_sponsorship_required: formData.visa_sponsorship_required,
          top_skills: formData.top_skills,
          work_style_preferences: formData.work_style_preferences,
          career_goals_short_term: formData.career_goals_short_term,
          career_goals_long_term: formData.career_goals_long_term,
          company_size_preference: formData.company_size_preference,
          resume_path: formData.resume_path,
          job_type: formData.job_type,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData);
      }

      const { error: dbError } = await supabase
        .from("user_info")
        .upsert(dataToSave, { onConflict: "user_id" });

      if (dbError) {
        setError(`Failed to save data: ${dbError.message}`);
      } else {
        toast.success("Your profile has been saved successfully!");
        router.push("/jobs");
      }
    } catch (submitException: unknown) {
      setError(
        `An unexpected error occurred during submission: ${
          submitException instanceof Error
            ? submitException.message
            : String(submitException)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  if (error && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <Card className="w-full max-w-md !shadow-none">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access the onboarding form.
            </CardDescription>
          </CardHeader>
          <CardContent className="!p-0">
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 items-center justify-center mt-32 mb-32  p-4">
      <div className="flex flex-col gap-5 max-w-2xl w-full">
        <p className="text-6xl font-bold ">
          Let&apos;s get you Hired, quickly.
        </p>
        {initialPreferencesState ? (
          <UserOnboardingPersonalization
            initialPreferences={initialPreferencesState}
          />
        ) : (
          ""
        )}
      </div>

      <Card className="w-full max-w-2xl !border-none !p-0 shadow-none">
        <CardHeader className="!p-0 mb-5">
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CurrentStepComponent
          formData={formData}
          setFormData={setFormData}
          errors={formErrors}
          setErrors={setFormErrors}
          loadingLocations={isLoadingLocations}
        />
        {error ? toast.error(error) : ""}

        <CardFooter className="flex items-center justify-between !p-0 mt-5">
          <Button
            variant={"secondary"}
            onClick={handleBack}
            disabled={currentStep === 0 || isLoading}
          >
            Back
          </Button>
          <Button onClick={handleNext} disabled={isLoading}>
            {isLoading
              ? "Processing..."
              : currentStep === totalSteps - 1
                ? "Submit"
                : "Next"}
          </Button>
        </CardFooter>
        <p className="text-muted-foreground text-xs text-center mt-5">
          No need to panic, you can always update this information.
        </p>
      </Card>
    </div>
  );
};
