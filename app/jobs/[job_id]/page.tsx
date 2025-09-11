import BackButton from "@/components/BackButton";
import Error from "@/components/Error";
import { createClient } from "@/lib/supabase/server";
import { IJob } from "@/lib/types";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, DollarSign, MapPin } from "lucide-react";
import JobDescriptionCard from "@/components/JobDetailsCard";
import { Badge } from "@/components/ui/badge";
import NavbarParent, { INavItem } from "@/components/NavbarParent";
import { v4 as uuidv4 } from "uuid";
import JobFavoriteBtn from "@/components/JobFavoriteBtn";
import JobApplyBtn from "@/components/JobApplyBtn";
import { allJobsSelectString } from "@/lib/filterQueryBuilder";

export default async function JobPage({
  params,
}: {
  params: Promise<{ job_id: string }>;
}) {
  try {
    const { job_id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let isCompanyUser = false;
    let onboardingComplete = false;
    // let ai_search_uses = 0;
    if (user) {
      const { data: jobSeekerData } = await supabase
        .from("user_info")
        .select("filled")
        .eq("user_id", user?.id)
        .single();
      const { data: companyData } = await supabase
        .from("company_info")
        .select("id, filled")
        .eq("user_id", user?.id)
        .single();

      if (companyData) {
        isCompanyUser = true;
      }

      if (jobSeekerData) {
        onboardingComplete = jobSeekerData.filled;
        // ai_search_uses = jobSeekerData.ai_search_uses;
      }
    }
    const selectString = `
           ${allJobsSelectString},
            user_favorites(*),
            job_postings(*, company_info(*), applications(*)),
            applications(*)
        `;

    const { data, error } = await supabase
      .from("all_jobs")
      .select(selectString)
      .eq("id", job_id)
      .single();

    const job = data as IJob;

    if (error || !job) {
      console.error("Error fetching job posting:", error);
      return <Error />;
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
            label: "Find Jobs",
            href: "/jobs",
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
      <>
        <NavbarParent navItems={navItems} />
        <div className="flex flex-col gap-8 w-full px-4 py-5 lg:px-20 xl:px-40 2xl:px-80">
          <div>
            <BackButton />
          </div>
          {/* --- Header Section --- */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white max-w-[400px]">
                  {job.job_name}
                </h1>
                <JobFavoriteBtn
                  isCompanyUser={isCompanyUser}
                  user={user}
                  userFavorites={job.user_favorites}
                  job_id={job.id}
                />
              </div>
              <p className="text-lg text-muted-foreground">
                at {job.company_name}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Posted on {format(new Date(job.created_at), "PPP")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <JobApplyBtn
                isCompanyUser={isCompanyUser}
                user={user}
                job={job}
                isOnboardingComplete={onboardingComplete}
              />
              {/* <JobStatusSwitch job={job} /> */}
              {/* <CreateJobPostingDialog
                      company_id={job.company_id}
                      existingValues={existingValues}
                    />
                    <DeleteJobPosting job_posting_id={job.id} is_job_posting_page />
                    <FindSuitableProfilesForJobPost job_post_id={job_id} /> */}
            </div>
          </div>
          {/* Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Details Card */}
            <JobDescriptionCard job={job} />

            {/* Key Metrics/Details Sidebar */}
            <div className="grid gap-4">
              <Card className="shadow-sm border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Location
                  </CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 text-2xl font-bold">
                    {job.locations && job.locations.length > 0 ? (
                      job.locations.map((loc, index) => (
                        <Badge key={index} variant="secondary" className="p-2">
                          {loc}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-base">
                        Not specified
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Salary</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {job.salary_range ? job.salary_range : "Not specified"}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Experience
                  </CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {job.experience ? job.experience : "Not specified"}
                  </div>
                </CardContent>
              </Card>

              {/* <Card className="shadow-sm border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Applicants
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {job.applications?.length}
                </div>
              </CardContent>
            </Card> */}
            </div>
          </div>
        </div>
      </>
    );
  } catch (err) {
    console.error("Error in JobPostPage:", err);
    return <Error />;
  }
}
