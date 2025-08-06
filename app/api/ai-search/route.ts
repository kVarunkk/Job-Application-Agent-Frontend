import { NextRequest, NextResponse } from "next/server";
import { createVertex } from "@ai-sdk/google-vertex";
import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { IJob } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { userId, jobs } = await request.json();

    if (!userId || !jobs) {
      return NextResponse.json(
        {
          message: "user_id and jobs are required in the request body.",
        },
        { status: 400 }
      );
    }

    // Step 1: Fetch user preferences from the database
    const { data } = await supabase
      .from("user_info")
      .select("*")
      .eq("user_id", userId)
      .single();
    const userPreferences = data;

    if (!userPreferences) {
      return NextResponse.json(
        {
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    // Step 2: Construct the userQuery based on fetched preferences
    const userQuery = `
      User is a candidate with the following preferences:
      - Desired Roles: ${userPreferences.desired_roles?.join(", ")}
      - Experience: ${userPreferences.experience_years} years
      - Preferred Locations: ${userPreferences.preferred_locations?.join(", ")}
      - Salary Range: $${userPreferences.min_salary} - $${
      userPreferences.max_salary
    }
      - Top Skills: ${userPreferences.top_skills?.join(", ")}
      - Work Style: ${userPreferences.work_style_preferences?.join(", ")}
      - Job Type: ${userPreferences.job_type?.join(", ")}
      - Company Size: ${userPreferences.company_size_preference}
      - Career Goals: ${userPreferences.career_goals_short_term} and ${
      userPreferences.career_goals_long_term
    }
      - Visa Sponsorship: ${
        userPreferences.visa_sponsorship_required ? "Yes" : "No"
      }
      
      Please re-rank the job listings to find the best possible match for this candidate.
    `;

    // Step 3: Call the AI with the augmented prompt
    const vertex = createVertex({
      project: "mern-twitter-368919",
      location: "us-central1",
    });
    const model = vertex("gemini-2.0-flash-lite-001");

    const rerankPrompt = `
      You are an expert search re-ranker. Your task is to evaluate a set of job listings
      against a user's query and re-rank them based on relevance, skills required,
      and experience level. You must only use the information provided for the jobs.
      
      **User Query:**
      ${userQuery}

      **Job Listings to Evaluate:**
      ${jobs
        .map(
          (job: IJob) => `
        ---
        ID: ${job.id}
        Title: ${job.job_name}
        Description: ${job.description}
        Experience: ${job.experience}
        Visa Requirement: ${job.visa_requirement}
        Salary Range: ${job.salary_range}
        Locations: ${job.locations}
        ---
      `
        )
        .join("\n")}
      
      **Instructions:**
      1.  Read the user's query carefully.
      2.  Analyze each job listing to determine its relevance to the query.
      3.  Re-rank the job IDs from most relevant to least relevant.
      4.  Filter out any jobs that are completely irrelevant or do not match the user's core intent.
      5.  Output a JSON array of the re-ranked job IDs. Do not include any other text.
    `;

    const { object } = await generateObject({
      model: model,
      prompt: rerankPrompt,
      schema: z.object({
        reranked_job_ids: z
          .array(z.string())
          .describe(
            "The list of re-ranked job IDs from most to least relevant."
          ),
        filtered_out_job_ids: z
          .array(z.string())
          .describe(
            "The list of job IDs that were filtered out as irrelevant."
          ),
      }),
    });

    await supabase
      .from("user_info")
      .update({
        ai_search_uses: userPreferences.ai_search_uses + 1,
      })
      .eq("user_id", userId);

    return NextResponse.json({
      rerankedJobs: object.reranked_job_ids,
      filteredOutJobs: object.filtered_out_job_ids,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      message: "An error occurred",
    });
  }
}
