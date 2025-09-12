// /app/sitemap.ts
import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data: jobs, error } = await supabase
    .from("all_jobs")
    .select("id")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch job IDs for sitemap:", error);
    // Return a basic sitemap if the fetch fails
    return [
      {
        url: "https://gethired.devhub.co.in",
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 1.0,
      },
      {
        url: "https://gethired.devhub.co.in/jobs",
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1.0,
      },
    ];
  }

  const jobUrls = jobs.map((job) => ({
    url: `https://gethired.devhub.co.in/jobs/${job.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticUrls = [
    {
      url: "https://gethired.devhub.co.in/",
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 1.0,
    },
    {
      url: "https://gethired.devhub.co.in/jobs",
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: "https://gethired.devhub.co.in/privacy-policy",
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: "https://gethired.devhub.co.in/terms-of-service",
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: "https://gethired.devhub.co.in/auth/login",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: "https://gethired.devhub.co.in/auth/sign-up",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: "https://gethired.devhub.co.in/auth/forgot-password",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
  ];

  return [...staticUrls, ...jobUrls];
}
