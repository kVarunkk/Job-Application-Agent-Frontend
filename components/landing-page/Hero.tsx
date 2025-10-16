"use client";

import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const maskStyle = {
  maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)", // For older browsers
};

// Define local paths
const JOB_SEEKER_DARK = "/hero/job-seeker-hero-dark.png";
const JOB_SEEKER_LIGHT = "/hero/job-seeker-hero-light.png";
const HIRE_PAGE_DARK = "/hero/company-hero-dark.png";
const HIRE_PAGE_LIGHT = "/hero/company-hero-light.png";

export default function Hero() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isHirePage = pathname.startsWith("/hire");

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  const getImagePath = () => {
    if (isHirePage) {
      return isDark ? HIRE_PAGE_DARK : HIRE_PAGE_LIGHT;
    } else {
      return isDark ? JOB_SEEKER_DARK : JOB_SEEKER_LIGHT;
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full items-center text-center px-4 py-3 lg:px-20 xl:px-40 2xl:px-80">
      <h1 className="text-5xl sm:text-6xl font-extrabold">
        The Future of {isHirePage ? "Talent Acquisition" : "Job Search"} Starts
        Here
      </h1>
      {isHirePage ? (
        <p>
          Find <strong>Exceptional</strong> candidates,{" "}
          <strong>Streamline</strong> your screening, and connect{" "}
          <strong>Directly</strong> with motivated talent
        </p>
      ) : (
        <p>
          Uncover <strong>Personalized</strong> opportunities,{" "}
          <strong>Automate</strong> your applications, and connect{" "}
          <strong>Directly</strong> with hiring companies
        </p>
      )}
      <div className="flex items-center gap-5">
        {!isHirePage && (
          <Link href={"/jobs"}>
            <Button>Get Hired!</Button>
          </Link>
        )}
        <Link href={isHirePage ? "/company" : "/hire"}>
          <Button
            variant={isHirePage ? "default" : "outline"}
            className={cn(
              !isHirePage &&
                "transition-colors duration-200 hover:bg-primary hover:text-primary-foreground border-primary text-primary"
            )}
          >
            Hire Talent
          </Button>
        </Link>
      </div>

      {mounted && (
        <Image
          className="rounded-xl border border-border drop-shadow-xl"
          src={getImagePath()} // Using the new local path function
          style={maskStyle}
          height={2000}
          width={2000}
          alt="Snapshot of the GetHired Job Board"
          priority // Set priority to load this critical image fast
        />
      )}
    </div>
  );
}
