"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import FilterComponent from "./FilterComponent";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function FilterComponentSheet({
  uniqueLocations,
  uniqueCompanies,
  uniqueJobRoles,
  uniqueIndustryPreferences,
  uniqueWorkStylePreferences,
  uniqueSkills,
  isCompanyUser,
  isProfilesPage = false,
  onboardingComplete,
}: {
  uniqueLocations: { location: string }[];
  uniqueCompanies: { company_name: string }[];
  uniqueJobRoles: { job_role: string }[];
  uniqueIndustryPreferences: { industry_preference: string }[];
  uniqueWorkStylePreferences: { work_style_preference: string }[];
  uniqueSkills: { skill: string }[];
  isCompanyUser: boolean;
  isProfilesPage?: boolean;
  onboardingComplete: boolean;
}) {
  const [openSheet, setOpenSheet] = useState(false);
  const searchParams = useSearchParams();

  const filtersApplied: {
    id: string;
    name: string;
    value: string;
  }[] = [];

  if (searchParams.size > 0) {
    searchParams.forEach((value, key) => {
      if (key !== "sortOrder" && key !== "sortBy" && key !== "job_post") {
        filtersApplied.push({
          id: uuidv4(),
          name: key,
          value,
        });
      }
    });
  }

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <SheetTrigger className="md:hidden underline underline-offset-2 text-primary">
        {filtersApplied.length > 0
          ? `${filtersApplied.length} Filter${
              filtersApplied.length > 1 ? "s" : ""
            } Applied`
          : "Apply Filters"}
      </SheetTrigger>
      <SheetContent side={"left"} className="h-full">
        <SheetHeader>
          <SheetTitle>
            {isCompanyUser ? "Profile" : "Job"} Search Filters
          </SheetTitle>
        </SheetHeader>
        {isProfilesPage && isCompanyUser ? (
          <FilterComponent
            uniqueLocations={uniqueLocations}
            uniqueJobRoles={uniqueJobRoles}
            uniqueIndustryPreferences={uniqueIndustryPreferences}
            uniqueWorkStylePreferences={uniqueWorkStylePreferences}
            uniqueSkills={uniqueSkills}
            isProfilesPage={isProfilesPage}
            setOpenSheet={setOpenSheet}
            onboardingComplete={onboardingComplete}
          />
        ) : (
          <FilterComponent
            uniqueLocations={uniqueLocations}
            uniqueCompanies={uniqueCompanies}
            setOpenSheet={setOpenSheet}
            onboardingComplete={onboardingComplete}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
