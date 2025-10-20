import Error from "@/components/Error";
import NavbarParent, { INavItem } from "@/components/NavbarParent";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { v4 as uuidv4 } from "uuid";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title:
      "Discover Top Tech Companies Hiring Now | GetHired Company Directory",
    description:
      "Explore the directory of companies hiring developers and engineers. Find companies by size, industry, location, and visa sponsorship policies.",
    keywords: [
      "tech company directory",
      "companies hiring developers",
      "software engineering jobs by company",
      "startups hiring tech talent",
      "visa sponsorship companies",
    ],
    alternates: {
      canonical: "https://gethired.devhub.co.in/companies",
    },
  };
}

export default async function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: companyData } = await supabase
      .from("company_info")
      .select("id, ai_search_uses, filled")
      .eq("user_id", user?.id)
      .single();

    let isCompanyUser = false;
    if (companyData) {
      isCompanyUser = true;
    }

    const navItems: INavItem[] = !isCompanyUser
      ? [
          {
            id: uuidv4(),
            label: "Home",
            href: "/",
            type: "equals",
          },
          {
            id: uuidv4(),
            label: "Jobs",
            href: "/jobs",
            type: "startswith",
          },
          {
            id: uuidv4(),
            label: "Companies",
            href: "/companies",
            type: "startswith",
          },
        ]
      : [
          {
            id: uuidv4(),
            label: "Home",
            href: "/company",
            type: "equals",
          },
          {
            id: uuidv4(),
            label: "Job Posts",
            href: "/company/job-posts",
            type: "equals",
          },
          {
            id: uuidv4(),
            label: "Applicants",
            href: "/company/applicants",
            type: "equals",
          },
          {
            id: uuidv4(),
            label: "Profiles",
            href: "/company/profiles",
            type: "equals",
          },
        ];

    return (
      <div className="h-screen ">
        <NavbarParent navItems={navItems} />
        {children}
      </div>
    );
  } catch {
    return <Error />;
  }
}
