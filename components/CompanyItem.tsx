"use client";

import Link from "next/link";
import { Link as ModifiedLink } from "react-transition-progress/next";
import { Badge } from "./ui/badge";
import { ICompanyInfo } from "@/lib/types";
import { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import JobFavoriteBtn from "./JobFavoriteBtn";
import ProgressBtn from "./ProgressBtn";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export default function CompanyItem({
  company,
  user,
  isSuitable,
  isCompanyUser,
}: {
  company: ICompanyInfo;
  user: User | null;
  isSuitable: boolean;
  isCompanyUser: boolean;
}) {
  return (
    <>
      <ProgressBtn href={`/companies/${company.id}`} className="text-start">
        <div
          className={cn(
            "flex flex-col gap-3 p-4 group  rounded-lg transition hover:bg-secondary "
          )}
        >
          <div className="flex-col sm:flex-row sm:flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2 mb-6 sm:mb-0">
              <div className="flex flex-col ">
                <div className="flex items-center gap-1">
                  <ModifiedLink
                    href={`/companies/${company.id}`}
                    className="inline-flex items-center gap-3 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      className="rounded-full"
                      src={company.logo_url}
                      alt="Company Logo"
                      width={40}
                    />
                    <h3 className="inline text-lg sm:text-xl font-semibold">
                      {company.name}
                    </h3>
                  </ModifiedLink>
                  <JobFavoriteBtn
                    isCompanyUser={isCompanyUser}
                    user={user}
                    userFavoritesCompanyInfo={company.user_favorites_companies}
                    company_id={company.id}
                  />
                </div>
                {company.tag_line && (
                  <p className="text-muted-foreground"> {company.tag_line}</p>
                )}
              </div>
              <CompanyDetailBadges company={company} isSuitable={isSuitable} />
            </div>
            <Link
              onClick={(e) => {
                e.stopPropagation();
              }}
              href={"/companies/" + company.id}
            >
              <Button>
                View <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </ProgressBtn>
    </>
  );
}

function CompanyDetailBadges({
  company,
  isSuitable,
}: {
  company: ICompanyInfo;
  isSuitable: boolean;
}) {
  const companyDetails = [
    {
      id: "location",
      value: company.headquarters,
      label: "Location",
    },
    {
      id: "industry",
      value: company.industry,
      label: "Industry",
    },
    {
      id: "size",
      value: company.company_size,
      label: "Size",
    },
  ];

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {companyDetails
        .filter((each) => each.value)
        .map((detail) => (
          <Badge
            variant={"outline"}
            key={detail.id}
            className={cn(
              "text-xs sm:text-sm font-medium group-hover:border-secondary-foreground"
            )}
          >
            {detail.value}
          </Badge>
        ))}

      {isSuitable && (
        <Badge
          className={cn(
            "text-xs sm:text-sm font-medium bg-green-200 text-green-700 !border-green-200 hover:bg-green-100 group-hover:border-secondary-foreground"
          )}
        >
          Company Match
        </Badge>
      )}
    </div>
  );
}
