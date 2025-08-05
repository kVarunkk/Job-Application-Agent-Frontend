"use client";

import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const maskStyle = {
  maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)", // For older browsers
};

export default function Hero() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false); // State to track if component is mounted

  // When component mounts, set mounted to true
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col gap-5 w-full items-center text-center px-4 py-3 lg:px-20 xl:px-40 2xl:px-80">
      <h1 className="text-5xl sm:text-6xl font-extrabold">
        The Future of Job Search Starts Here
      </h1>
      <p className="text-muted-foreground">
        Uncover <strong>Personalized</strong> opportunities,{" "}
        <strong>Automate</strong> your applications, and connect{" "}
        <strong>Directly</strong> with hiring companies
      </p>
      <div className="flex items-center gap-5">
        <Link href={"/jobs"}>
          <Button>Get Hired!</Button>
        </Link>
      </div>

      {mounted && (
        <Image
          className="rounded-xl border border-border drop-shadow-xl"
          src={
            theme === "dark" || (theme === "system" && systemTheme === "dark")
              ? "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/Screenshot%202025-07-28%20at%2023-32-47%20Job%20Application%20Agent.png"
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
