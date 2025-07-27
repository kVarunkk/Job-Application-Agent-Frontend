"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import FilterComponent from "./FilterComponent";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function FilterComponentSheet({
  uniqueLocations,
  uniqueCompanies,
}: {
  uniqueLocations: { location: string }[];
  uniqueCompanies: { company_name: string }[];
}) {
  const [openSheet, setOpenSheet] = useState(false);
  const searchParams = useSearchParams();

  let filtersApplied: {
    id: string;
    name: string;
    value: string;
  }[] = [];

  if (searchParams.size > 0) {
    searchParams.forEach((value, key) => {
      if (key !== "sortOrder" && key !== "sortBy") {
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
          ? `${filtersApplied.length} Filters Applied`
          : "Apply Filters"}
      </SheetTrigger>
      <SheetContent side={"left"} className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Job Search Filters</SheetTitle>
        </SheetHeader>
        <FilterComponent
          uniqueLocations={uniqueLocations}
          uniqueCompanies={uniqueCompanies}
          setOpenSheet={setOpenSheet}
        />
      </SheetContent>
    </Sheet>
  );
}
