"use client";

import React from "react";
import Link from "next/link"; // For internal links
import { LinkedInLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";

export default function Footer() {
  return (
    <footer className=" px-4 py-20 lg:px-20 xl:px-40 2xl:px-80 mt-auto">
      <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Brand / About */}
        <div>
          <Link href={"/"} className="text-lg font-bold mb-3">
            GetHired
          </Link>
          <p className="text-sm text-muted-foreground">
            Your smartest path to the perfect job. Revolutionizing recruitment
            with AI & automation.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/about"
                className="hover:underline  hover:opacity-100 transition-opacity"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:underline  hover:opacity-100 transition-opacity"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="hover:underline  hover:opacity-100 transition-opacity"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="hover:underline  hover:opacity-100 transition-opacity"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                href="/companies"
                className="hover:underline  hover:opacity-100 transition-opacity"
              >
                For Companies
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Media / Contact */}
        <div>
          <h3 className="text-lg font-bold mb-3">Connect With Us</h3>
          <div className="flex justify-center md:justify-start space-x-4 mb-4 text-muted-foreground">
            <Link
              href="https://linkedin.com/yourprofile"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-foreground transition-colors"
            >
              <LinkedInLogoIcon />
            </Link>
            <Link
              href="https://x.com/yourprofile"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-foreground transition-colors"
            >
              <TwitterLogoIcon />
            </Link>
            {/* Add more social icons as needed */}
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} GetHired. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
