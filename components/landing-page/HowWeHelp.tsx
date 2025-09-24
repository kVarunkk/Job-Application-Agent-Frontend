"use client";

import { LightningBoltIcon } from "@radix-ui/react-icons";
import { v4 as uuidv4 } from "uuid";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { OrbitingCircles } from "../magicui/orbiting-circles";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import Image from "next/image";

const platforms = [
  {
    id: uuidv4(),
    name: "ycombinator",
    src: "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/brands/ycombinator.png",
    href: "https://workatastartup.com",
  },
  {
    id: uuidv4(),
    name: "remoteok",
    src: "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/brands/remoteok.png",
    href: "https://remoteok.com",
  },
  {
    id: uuidv4(),
    name: "uplers",
    src: "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/brands/uplers-1.png",
    href: "https://ats.uplers.com",
  },
  {
    id: uuidv4(),
    name: "wellfound",
    src: "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/brands/wellfound-1.png",
    href: "https://wellfound.com",
  },
  {
    id: uuidv4(),
    name: "ycombinator",
    src: "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/brands/ycombinator.png",
    href: "https://workatastartup.com",
  },
  {
    id: uuidv4(),
    name: "remoteok",
    src: "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/brands/remoteok.png",
    href: "https://remoteok.com",
  },
  {
    id: uuidv4(),
    name: "uplers",
    src: "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/brands/uplers-1.png",
    href: "https://ats.uplers.com",
  },
  {
    id: uuidv4(),
    name: "wellfound",
    src: "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/brands/wellfound-1.png",
    href: "https://wellfound.com",
  },
];

export function HowWeHelp() {
  const [isPaused, setIsPaused] = useState(false);
  const { theme, systemTheme } = useTheme();

  const [mounted, setMounted] = useState(false); // State to track if component is mounted

  // When component mounts, set mounted to true
  useEffect(() => {
    setMounted(true);
  }, []);

  const memoizedFeatures = useMemo(() => {
    if (mounted) {
      return [
        {
          // Icon: FileSearchIcon,
          name: "Personalized Job Discovery",
          description:
            "Stop wasting time on irrelevant jobs. Our advanced matching system learns your preferences and skills to bring you opportunities you'll actually love",
          href: "/jobs",
          cta: "Find your Dream Job",
          background: (
            <Image
              alt="Feature"
              src={
                theme === "dark" ||
                (theme === "system" && systemTheme === "dark")
                  ? "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/Screenshot%202025-07-29%20205115.png"
                  : "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/Screenshot%202025-07-29%20204910.png"
              }
              width={400}
              height={400}
              className="absolute -right-0 -top-0 opacity-30"
            />
          ),
          className: "lg:row-start-2 lg:row-end-3 lg:col-start-2 lg:col-end-3",
        },
        {
          // Icon: InputIcon,
          name: "Effortless Application Management",
          description:
            "Manage all your applications in one place. Soon, you'll be able to auto-apply to multiple jobs across various platforms with just a few clicks, saving you hours",
          href: "/jobs",
          cta: "Start Applying",
          background: (
            <Image
              alt="Feature"
              src={
                theme === "dark" ||
                (theme === "system" && systemTheme === "dark")
                  ? "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/Screenshot%202025-07-29%20203706.png"
                  : "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/Screenshot%202025-07-29%20204646.png"
              }
              width={400}
              height={400}
              className="absolute -right-0 -top-0 opacity-30"
            />
          ),
          className: "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2",
        },
        {
          // Icon: GlobeIcon,
          name: "Multiplatform Support",
          description: "Supports 10+ leading Job Boards.",
          href: "/",
          cta: "Learn more",
          background: (
            <div className="relative flex flex-col items-center justify-center overflow-hidden h-[250px] lg:h-[350px] w-full opacity-80 scale-125">
              {/* Layer 1: Slower, larger orbit, maybe less saturated logos */}

              {/* Layer 2: Main orbit, standard size and speed */}
              <OrbitingCircles paused={isPaused} iconSize={60} duration={25}>
                {/* Adjust duration to your liking */}
                {platforms
                  .filter((platform, index) => index <= 3)
                  .map((each) => (
                    <Link
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => setIsPaused(false)}
                      href={each.href}
                      key={each.id} // Key should be on the outermost element
                      className="flex items-center justify-center p-3 rounded-full bg-white/10 dark:bg-gray-700/50 shadow-md backdrop-blur-sm transition-transform duration-300 ease-in-out
               hover:scale-150" // Background div for consistency
                      // style={{ width: "60px", height: "60px" }} // Fixed size for the container
                    >
                      <Image
                        src={each.src}
                        className="object-contain max-w-full max-h-full drop-shadow-md " // Ensure image fits within its container
                        alt={each.name || `Platform logo for ${each.id}`}
                        width={400}
                        height={400}
                      />
                    </Link>
                  ))}
              </OrbitingCircles>

              {/* Layer 3: Smaller, faster, reversed orbit, perhaps more prominent logos or a different set */}
              <OrbitingCircles
                radius={100}
                reverse
                duration={15}
                iconSize={40} // This iconSize might need adjustment based on the new container size
                className="z-10"
                paused={isPaused}
              >
                {/* Faster, smaller radius, z-index to appear on top */}
                {platforms
                  .filter((platform, index) => index > 3) // Pick another subset
                  .map((each) => (
                    <Link
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => setIsPaused(false)}
                      href={each.href}
                      key={each.id} // Key should be on the outermost element
                      className="flex items-center justify-center p-2 rounded-full bg-white/10 dark:bg-gray-700/50 shadow-md backdrop-blur-sm transition-transform duration-300 ease-in-out
               hover:scale-150" // Background div for consistency
                      // style={{ width: "60px", height: "60px" }} // Fixed size for the container
                    >
                      <Image
                        src={each.src}
                        className="object-contain max-w-full max-h-full drop-shadow-md " // Ensure image fits within its container
                        alt={each.name || `Platform logo for ${each.id}`}
                        width={400}
                        height={400}
                      />
                    </Link>
                  ))}
              </OrbitingCircles>

              {/* Optional: Central element or text */}
              <div className="absolute z-20  text-center">
                <LightningBoltIcon height={30} />
              </div>
            </div>
          ),
          className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
        },
        {
          // Icon: CalendarIcon,
          name: "Direct Connections & Opportunities",
          description:
            "Connect directly with companies. Discover exclusive job postings and get your profile seen by hiring managers who are actively looking for talent like yours, right here on our platform.",
          href: "/",
          cta: "Learn more",
          background: (
            <Image
              alt="Feature"
              src={
                theme === "dark" ||
                (theme === "system" && systemTheme === "dark")
                  ? "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/Screenshot%202025-07-29%20223352.png"
                  : "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/Screenshot%202025-07-29%20223643.png"
              }
              width={400}
              height={400}
              className="absolute -right-0 -top-60 opacity-30 h-[450px] w-[400px] sm:h-auto sm:w-auto"
            />
          ),
          className: "lg:col-start-1 lg:col-end-3 lg:row-start-3 lg:row-end-4",
        },
      ];
    } else return [];
  }, [isPaused, setIsPaused, mounted, theme, systemTheme]);
  return (
    <div
      id="howwehelp"
      className="flex flex-col  items-center px-4 py-3 lg:px-20 xl:px-40 2xl:px-80"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          How We Help You Get Hired
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Revolutionizing your job search with efficiency and precision.
        </p>
      </div>
      <BentoGrid className="lg:grid-rows-3 lg:grid-cols-2">
        {memoizedFeatures.map((feature) => (
          <BentoCard key={feature.name} {...feature} />
        ))}
      </BentoGrid>
    </div>
  );
}
