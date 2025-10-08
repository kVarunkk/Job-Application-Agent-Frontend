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

export default function Hero() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  let isHirePage = pathname.startsWith("/hire");

  useEffect(() => {
    setMounted(true);
  }, []);

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
          src={
            theme === "dark" || (theme === "system" && systemTheme === "dark")
              ? isHirePage
                ? "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/hire_page/company-hero-dark.png"
                : "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/Screenshot%202025-07-28%20at%2023-32-47%20Job%20Application%20Agent.png"
              : isHirePage
              ? "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/hire_page/company-hero-light.png"
              : "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/Screenshot%202025-07-28%20at%2023-32-35%20Job%20Application%20Agent.png"
          }
          style={maskStyle}
          height={2000}
          width={2000}
          alt="Snapshot of the GetHired Job Board"
        />
      )}
    </div>
  );
}
