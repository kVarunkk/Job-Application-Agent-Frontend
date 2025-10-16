"use client";

import React from "react";
import Link from "next/link"; // For internal links
import { BriefcaseBusiness } from "lucide-react";
import Brand from "../Brand";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Array of popular location/type searches (Replace href with actual filtered routes)
  const popularSearches = [
    {
      name: "Remote Jobs",
      href: "/jobs?location=Remote&sortBy=created_at&sortOrder=desc",
    },
    {
      name: "Jobs in San Francisco",
      href: "/jobs?location=San+Francisco&sortBy=created_at&sortOrder=desc",
    },
    {
      name: "Jobs in New York",
      href: "/jobs?location=New+York&sortBy=created_at&sortOrder=desc",
    },
    {
      name: "Tech Jobs in Bangalore",
      href: "/jobs?jobTitleKeywords=developer%7Cengineer&location=Bangalore&sortBy=created_at&sortOrder=desc",
    },
    {
      name: "Senior Developer Roles",
      href: "/jobs?jobTitleKeywords=senior&sortBy=created_at&sortOrder=desc",
    },
  ];

  return (
    <footer className="px-4 py-20 lg:px-20 xl:px-40 2xl:px-80 mt-auto">
      <div className="container mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
        {/* ==================================== */}
        {/* 1. Brand / About (Col 1) */}
        {/* ==================================== */}
        <div className="flex flex-col items-center md:items-start gap-5 col-span-2 md:col-span-1">
          <Link href={"/"} className="w-fit">
            <Brand type="long" />
            {/* <span className="text-xl font-bold">GetHired</span>{" "} */}
            {/* Placeholder for Brand Component */}
          </Link>
          <p className="text-sm text-muted-foreground">
            Your smartest path to the perfect job.
          </p>
        </div>

        {/* ==================================== */}
        {/* 2. Quick Links (Col 2) */}
        {/* ==================================== */}
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-lg font-bold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/jobs"
                className="hover:underline hover:opacity-100 transition-opacity"
              >
                Jobs
              </Link>
            </li>
            <li>
              <Link
                href="/companies"
                className="hover:underline hover:opacity-100 transition-opacity"
              >
                Companies
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="hover:underline hover:opacity-100 transition-opacity"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="/hire"
                className="hover:underline hover:opacity-100 transition-opacity"
              >
                For Companies
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="hover:underline hover:opacity-100 transition-opacity"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms-of-service"
                className="hover:underline hover:opacity-100 transition-opacity"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        {/* ==================================== */}
        {/* 3. Popular Searches (NEW Col 3) */}
        {/* ==================================== */}
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-lg font-bold mb-3">Popular Searches</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {popularSearches.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="hover:underline hover:opacity-100 transition-opacity"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ==================================== */}
        {/* 4. Social Media / Contact (Col 4) */}
        {/* ==================================== */}
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-lg font-bold mb-3">Connect With Us</h3>
          <div className="flex justify-center md:justify-start space-x-4 mb-4 text-muted-foreground">
            {/* Use the correct icons when implemented */}
            <Link href={"mailto:varun@devhub.co.in"} aria-label="Email">
              <BriefcaseBusiness size={16} />
            </Link>
            {/* Add more social icons here (LinkedIn, Twitter/X, etc.) */}
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} GetHired. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
