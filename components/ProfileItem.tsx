"use client";

import { User } from "@supabase/supabase-js";
import {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";
import { cn } from "@/lib/utils";
import { Dot, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { ICompanyInfo, IFormData } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "./ui/badge";
import ProfileFavoriteStar from "./ProfileFavoriteStar";

export default function ProfileItem({
  profile,
  user,
  isSuitable,
  activeCardID,
  setActiveCardID,
}: {
  profile: IFormData;
  user: User | null;
  isSuitable: boolean;
  activeCardID?: string;
  setActiveCardID: Dispatch<SetStateAction<string | undefined>>;
}) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const [companyInfo, setCompanyInfo] = useState<ICompanyInfo | null>(null);
  const supabase = createClient();

  const isActive = activeCardID === profile.user_id;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouchDevice("ontouchstart" in window);
    }
  }, []);

  const handleToggleDescription = useCallback(() => {
    if (isActive) {
      setActiveCardID(undefined);
    } else {
      setActiveCardID(profile.user_id);
    }
  }, [isActive, profile.user_id, setActiveCardID]);

  useEffect(() => {
    (async () => {
      try {
        const { data, error: companyError } = await supabase
          .from("company_info")
          .select("*")
          .eq("user_id", user?.id)
          .single();

        if (companyError || !data) throw companyError;

        setCompanyInfo(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user?.id, supabase]);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 group rounded-lg transition",
        isActive ? "bg-secondary" : ""
      )}
      onMouseEnter={() => {
        if (!isTouchDevice) setActiveCardID(profile.user_id);
      }}
      onMouseLeave={() => {
        if (!isTouchDevice) setActiveCardID(undefined);
      }}
      onClick={handleToggleDescription}
      tabIndex={0}
      role="button"
    >
      <div className="flex-col sm:flex-row sm:flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2 mb-6 sm:mb-0">
          <div className="flex items-center flex-wrap">
            <h3 className="text-lg sm:text-xl font-semibold">
              {profile.full_name || "N/A"}
            </h3>
            <Dot />
            <p className="text-muted-foreground text-wrap">
              {profile?.desired_roles?.[0] || ""}
            </p>

            <ProfileFavoriteStar profile={profile} companyInfo={companyInfo} />
          </div>
          <ProfileDetailBadges
            profile={profile}
            showDescription={isActive}
            isSuitable={isSuitable}
          />
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/company/profiles/${profile.user_id}`}>
            <Button>
              View Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-y-auto ${
          isActive ? "max-h-96 opacity-100 py-2" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-bold">Desired Roles</span>
            <p>
              {profile.desired_roles?.join(", ") ||
                "No short-term career goals specified."}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold">Short Term Career Goals</span>{" "}
            <p>
              {profile.career_goals_short_term ||
                "No short-term career goals specified."}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold">Long Term Career Goals</span>
            <p>
              {profile.career_goals_long_term ||
                "No long-term career goals specified."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileDetailBadges({
  profile,
  showDescription,
  isSuitable,
}: {
  profile: IFormData;
  showDescription: boolean;
  isSuitable: boolean;
}) {
  const [jobDetails, setJobDetails] = useState<
    {
      id: string;
      value: string;
      label: string;
    }[]
  >([]);

  useEffect(() => {
    const buildSalaryRange = () => {
      const minSalary = profile?.min_salary || 0;
      const maxSalary = profile?.max_salary || 0;
      if (minSalary === 0 && maxSalary === 0) {
        return "Not specified";
      }
      if (minSalary === maxSalary) {
        return `${minSalary} ${profile?.salary_currency || ""}`;
      }
      if (!maxSalary) {
        return `${minSalary}${profile?.salary_currency || ""} + `;
      }
      return `${minSalary} - ${maxSalary} ${profile?.salary_currency || ""}`;
    };

    if (profile) {
      setJobDetails(() => [
        {
          id: "experience",
          value: `${profile.experience_years} Years`,
          label: "Experience Years",
        },
        {
          id: "salary_range",
          value: buildSalaryRange(),
          label: "Salary Range",
        },
        {
          id: "skills",
          value: profile.top_skills.join(", "),
          label: "Skills",
        },
        {
          id: "locations",
          value: profile.preferred_locations.join(", "),
          label: "Locations",
        },
        {
          id: "job_type",
          value: profile.job_type.join(", "),
          label: "Job Type",
        },
      ]);
    }
  }, [profile]);

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

      {isSuitable && (
        <Badge
          className={cn(
            "text-xs sm:text-sm font-medium bg-green-200 text-green-700 !border-green-200 hover:bg-green-100",
            showDescription ? "border-secondary-foreground" : ""
          )}
        >
          Profile Match
        </Badge>
      )}
    </div>
  );
}
