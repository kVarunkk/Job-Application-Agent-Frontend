import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAllDigestUsers, sendJobDigestEmail } from "@/lib/digest-utils";
import { IFormData, IJob } from "@/lib/types";

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

const productionUrl = "https://gethired.devhub.co.in";
const URL =
  process.env.NODE_ENV === "production"
    ? productionUrl
    : process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const headersList = await headers();

  // --- 1. Security Check (CRITICAL) ---
  // Ensure this route is only called by your trusted cron service
  const cronSecret = headersList.get("X-Internal-Secret");
  if (cronSecret !== INTERNAL_API_SECRET) {
    return NextResponse.json(
      { message: "Unauthorized access to digest route" },
      { status: 401 }
    );
  }

  const digestDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  try {
    const users = await getAllDigestUsers();
    const digestPromises = users.map((user) =>
      processUserDigest(user, digestDate)
    );

    // Wait for all user emails to be processed
    await Promise.all(digestPromises);

    return NextResponse.json({
      success: true,
      message: `Successfully processed digest for ${users.length} users.`,
    });
  } catch (error) {
    console.error("Global Job Digest Execution Failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process all job digests.",
      },
      { status: 500 }
    );
  }
}

/**
 * Core logic to fetch, rerank, and send jobs for a single user.
 */
async function processUserDigest(user: IFormData, digestDate: string) {
  try {
    // --- 2. Initial Vector Search (Step 1) ---

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    // Convert to ISO string (YYYY-MM-DDTHH:MM:SS.mmmZ) for accurate transfer and SQL comparison
    const cutoffDate = sevenDaysAgo.toISOString();

    const jobFetchRes = await fetch(
      `${URL}/api/jobs?sortBy=relevance&limit=100&createdAfter=${cutoffDate}`,
      {
        cache: "force-cache",
        headers: {
          "X-Internal-Secret": INTERNAL_API_SECRET || "",
        },
      }
    );

    if (!jobFetchRes.ok) {
      throw new Error(
        `API jobs endpoint failed with status ${jobFetchRes.status}`
      );
    }

    const result = await jobFetchRes.json();
    const initialJobs: IJob[] = result.data || [];

    // --- 3. AI Re-ranking (Step 2) ---
    let finalJobs: IJob[] = initialJobs;

    if (initialJobs.length > 0) {
      const aiRerankRes = await fetch(`${URL}/api/ai-search/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Secret": INTERNAL_API_SECRET || "",
        },
        body: JSON.stringify({
          userId: user.user_id,
          // Map only the data required for the LLM to process
          jobs: initialJobs.map((job) => ({
            id: job.id,
            job_name: job.job_name,
            description: job.description,
            visa_requirement: job.visa_requirement,
            salary_range: job.salary_range,
            locations: job.locations,
            experience: job.experience,
          })),
        }),
      });

      if (!aiRerankRes.ok) {
        // 1. Log the status code
        console.error(
          `AI Rerank API failed with status: ${aiRerankRes.status}`
        );

        // 2. Read the full text body to see the HTML error page content
        const errorText = await aiRerankRes.text();
        console.error(
          "AI Rerank API error body:",
          errorText.substring(0, 500) + "..."
        ); // Log the start of the HTML body

        // 3. Throw a descriptive error
        throw new Error(`AI Rerank API failed (Status: ${aiRerankRes.status})`);
      }

      const aiRerankResult: {
        rerankedJobs: string[];
        filteredOutJobs: string[];
      } = await aiRerankRes.json();

      if (aiRerankRes.ok && aiRerankResult.rerankedJobs) {
        const uniqueRerankedIds = Array.from(
          new Set(aiRerankResult.rerankedJobs)
        );
        const filteredOutIds: string[] = aiRerankResult.filteredOutJobs || [];

        const jobMap = new Map(initialJobs.map((job: IJob) => [job.id, job]));

        // Re-order and filter the original job objects
        finalJobs = uniqueRerankedIds
          .map((id: string) => jobMap.get(id))
          .filter(
            (job: IJob | undefined) =>
              job !== undefined && !filteredOutIds.includes(job.id)
          ) as IJob[];
      }
    }

    // --- 4. Send Email (Top 10 Jobs) ---
    // Ensure you only send a manageable number of jobs (e.g., top 10)
    const topJobs = finalJobs.slice(0, 10);

    if (topJobs.length > 0 && user.email && user.full_name) {
      await sendJobDigestEmail(user.email, user.full_name, topJobs, digestDate);
      console.log(`Sent digest to ${user.email} with ${topJobs.length} jobs.`);
    } else {
      console.log(`Skipped digest for ${user?.email}: no suitable jobs found.`);
    }
  } catch (e) {
    console.error(`Error processing digest for user ${user?.email}:`, e);
  }
}
