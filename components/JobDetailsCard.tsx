"use client";

import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { IJob, IJobPosting } from "@/lib/types";

export default function JobDescriptionCard({
  job,
}: {
  job: IJobPosting | IJob;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="md:col-span-2 shadow-sm border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Job Description</CardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          "max-h-[400px] overflow-hidden group relative transition-all duration-300",
          isExpanded && "max-h-[1000px] overflow-y-auto"
        )}
      >
        <p className="whitespace-pre-line">{job.description}</p>
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 flex items-center justify-center pt-8 bg-gradient-to-t from-background via-background/90 to-transparent transition-all duration-300 rounded-b-lg",
            isExpanded ? "opacity-0 invisible" : "opacity-100 visible"
          )}
        >
          <button
            onClick={toggleDescription}
            className="flex items-center justify-center gap-1 text-primary hover:underline font-semibold w-full mb-5"
          >
            <ArrowDown className="h-4 w-4" />
            Show more
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
