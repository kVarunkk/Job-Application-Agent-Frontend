"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"; // Shadcn Card components
import { Pointer } from "../magicui/pointer";
import { MousePointer2 } from "lucide-react";
import { GridPattern } from "../magicui/grid-pattern";

interface MetricCardProps {
  value: string;
  title: string;
  description: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  value,
  title,
  description,
}) => (
  <Card className="text-center bg-card transition-transform duration-300 hover:scale-[1.02] !border border-border">
    <CardHeader>
      <CardTitle className="text-2xl sm:text-4xl font-extrabold text-primary mb-2">
        {value}
      </CardTitle>
      <CardDescription className=" font-semibold">{title}</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function TheGetHiredAdvantageSection() {
  return (
    <section className="relative px-4 py-24 lg:px-20 xl:px-40 2xl:px-80 bg-muted">
      {" "}
      <GridPattern
        width={30}
        height={30}
        // x={-1}
        // y={-1}
        strokeDasharray={"4 2"}
        className={cn(
          "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] ",
          "-z-8" //   "-z-10"
        )}
      />
      {/* Using bg-muted for a subtle contrast */}
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The{" "}
            <span className="underline underline-offset-4 decoration-4">
              GetHired
            </span>{" "}
            Advantage
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Revolutionizing your job search with efficiency and precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 z-10">
          <MetricCard
            value="5x Faster"
            title="Apply in Minutes"
            description="Our smart automation cuts down application time, freeing you to focus on interviews."
          />
          <MetricCard
            value="3x More Relevant"
            title="Discover Tailored Roles"
            description="Our AI deeply understands your profile and surfaces opportunities perfectly aligned with your skills."
          />
          <MetricCard
            value="Exclusive Access"
            title="Connect Directly"
            description="Gain a competitive edge with unique job postings straight from hiring companies."
          />
          <Pointer>
            <MousePointer2 className="w-6 h-6 text-yellow-500 fill-yellow-300" />{" "}
            {/* Style your pointer icon */}
          </Pointer>
        </div>
      </div>
      <GridPattern
        width={30}
        height={30}
        // x={-1}
        // y={-1}
        strokeDasharray={"4 2"}
        className={cn(
          "[mask-image:linear-gradient(to_top_left,white,transparent,transparent)] " //   "-z-10"
        )}
      />
    </section>
  );
}
