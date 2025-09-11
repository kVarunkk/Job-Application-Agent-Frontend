"use client";

import { useRouter, useSearchParams } from "next/navigation";
import AppLoader from "./AppLoader";
import { Button } from "./ui/button";
import { useProgress } from "react-transition-progress";
import { Dispatch, SetStateAction, startTransition, useCallback } from "react";

export default function FilterActions({
  isProfilesPage,
  setOpenSheet,
  isApplyFiltersLoading,
}: {
  isProfilesPage: boolean;
  setOpenSheet: Dispatch<SetStateAction<boolean>> | undefined;
  isApplyFiltersLoading: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startProgress = useProgress();

  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");
  const tab = searchParams.get("tab");

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);
    if (tab) params.set("tab", tab);
    if (setOpenSheet) setOpenSheet(false);
    startTransition(() => {
      startProgress();
      router.push(
        `/${isProfilesPage ? "company/profiles" : "jobs"}?${params.toString()}`
      );
    });
  }, [sortBy, sortOrder, tab, setOpenSheet, router, isProfilesPage]);

  return (
    <div className="flex items-center justify-between">
      <button type="button" className="underline" onClick={clearFilters}>
        Clear Filters
      </button>

      <Button type="submit" disabled={isApplyFiltersLoading}>
        Apply Filters
        {isApplyFiltersLoading && <AppLoader size="sm" color="secondary" />}
      </Button>
    </div>
  );
}
