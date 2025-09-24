"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProgress } from "react-transition-progress";
import { User } from "@supabase/supabase-js";

export function ClientTabs({
  user,
  isCompanyUser,
  isAISearch,
  applicationStatusFilter,
  children,
}: {
  user: User | null;
  isCompanyUser: boolean;
  isAISearch: boolean;
  applicationStatusFilter?: string | false;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const startProgress = useProgress();
  const initialTab = searchParams.get("tab") || "all";
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (newTab: "all" | "saved" | "applied") => {
    setActiveTab(newTab);
    startTransition(() => {
      startProgress();
      const newSearchParams = new URLSearchParams(searchParams.toString());
      if (newTab === "all") {
        newSearchParams.delete("tab");
      } else {
        newSearchParams.set("tab", newTab);
      }
      router.push(`/jobs?${newSearchParams.toString()}`);
    });
  };

  return (
    <Tabs value={activeTab}>
      {user && !isCompanyUser && !isAISearch && (
        <TabsList>
          {!applicationStatusFilter && (
            <TabsTrigger
              value="all"
              className="p-0"
              onClick={() => handleTabChange("all")}
              disabled={isPending}
            >
              <span className="py-1 px-2">All Jobs</span>
            </TabsTrigger>
          )}
          {!applicationStatusFilter && (
            <TabsTrigger
              value="saved"
              className="p-0"
              onClick={() => handleTabChange("saved")}
              disabled={isPending}
            >
              <span className="py-1 px-2">Saved Jobs</span>
            </TabsTrigger>
          )}
          <TabsTrigger
            value="applied"
            className="p-0"
            onClick={() => handleTabChange("applied")}
            disabled={isPending}
          >
            <span className="py-1 px-2">Applied Jobs</span>
          </TabsTrigger>
        </TabsList>
      )}

      {children}
    </Tabs>
  );
}
