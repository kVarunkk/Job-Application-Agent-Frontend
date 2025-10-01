"use client";

import Link from "next/link";
import { Button } from "./ui/button";

export default function FootComponent() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 bg-primary-foreground rounded-xl shadow-2xl border border-primary/20">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-primary text-center mb-3 tracking-tight">
        Ready to make your next big move?
      </h2>

      <p className="text-lg text-primary/80 text-center mb-8 max-w-2xl">
        Join thousands of professionals finding their dream job—or the perfect
        candidate—today.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <Link className="w-full" href={"/jobs"} passHref>
          <Button
            size="lg"
            className="w-full sm:w-auto px-8 py-3 text-lg font-semibold transition-transform duration-200 hover:scale-[1.03] shadow-lg shadow-primary/30"
          >
            Explore Job Listings
          </Button>
        </Link>

        <Link className="w-full" href={"/auth/login?company=true"} passHref>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-8 py-3 text-lg font-semibold transition-colors duration-200 hover:bg-primary hover:text-primary-foreground border-primary text-primary"
          >
            Hire Top Talent
          </Button>
        </Link>
      </div>
    </div>
  );
}
