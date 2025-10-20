import AppLoader from "@/components/AppLoader";
import { SignUpForm } from "@/components/sign-up-form";
import { Metadata } from "next";
import { Suspense } from "react";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { company } = await searchParams;

  if (company && company === "true") {
    return {
      title: "Company Sign up | Access Your Recruiting Dashboard",
      description:
        "Recruiter sign up for GetHired. Access your hiring dashboard, manage job postings, and review candidates sourced by your AI agent.",
      keywords: [
        "recruiter sign up",
        "hiring manager sign in",
        "company dashboard",
        "recruitment platform access",
      ],
      alternates: {
        canonical: "https://gethired.devhub.co.in/auth/sign-up?company=true",
      },
    };
  }

  return {
    title: "Applicant Signup | Access Your Job Applications & Dashboard",
    description:
      "Sign up to your GetHired account to track job applications, manage your profile, and see your top AI-matched job opportunities.",
    keywords: [
      "job seeker sign up",
      "applicant sign up",
      "track job applications",
      "job search dashboard",
    ],
    alternates: {
      canonical: "https://gethired.devhub.co.in/auth/sign-up",
    },
  };
}

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<AppLoader color="secondary" />}>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
