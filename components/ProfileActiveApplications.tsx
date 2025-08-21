"use client";

import { IApplication } from "@/lib/types";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import { Button } from "./ui/button";

export default function ProfileActiveApplication({
  app,
}: {
  app: IApplication;
}) {
  return (
    <div className=" w-full  rounded-lg flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <p className=" text-sm">
          Applied for:{" "}
          <Link href={`/jobs/${app.job_postings?.id}`} className="underline">
            {app.job_postings?.title}
          </Link>
        </p>
        <div className="text-sm text-muted-foreground">
          Applied on {format(new Date(app.created_at), "PPP")}
        </div>
        <Badge variant={"secondary"} className="w-fit">
          {app.status}
        </Badge>
      </div>
      <Link href={`/company/applicants/${app.id}`}>
        <Button variant={"outline"}>View Application</Button>
      </Link>
    </div>
  );
}
