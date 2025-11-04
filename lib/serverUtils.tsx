import { createVertex } from "@ai-sdk/google-vertex";
import fs from "fs/promises";
import path from "path";

export async function getVertexClient() {
  const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;

  if (!credentialsJson) {
    throw new Error("GOOGLE_CREDENTIALS_JSON environment variable is not set.");
  }

  const tempFilePath = path.join("/tmp", "credentials.json");

  try {
    await fs.writeFile(tempFilePath, JSON.parse(`"${credentialsJson}"`));
  } catch {
    throw new Error("Failed to set up credentials for Vertex AI.");
  }

  process.env.GOOGLE_APPLICATION_CREDENTIALS = tempFilePath;

  return createVertex({
    project: "mern-twitter-368919",
    location: "us-central1",
  });
}

export function getCutOffDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}

export const featureData = {
  title: " AI Natural Language Search is LIVE!",
  description:
    "Stop wasting time with filters! Our upgraded search engine lets you describe your dream job in plain English (e.g., 'Remote Python jobs in NYC with visa sponsorship'). Click continue to start using it now.",
  confirmButtonLabel: "Start Searching",
  featureHighlight:
    "Type any job query and our AI builds the filters instantly.",
  promoImage: "/Screenshot 2025-11-05 001432.png", // Suggested custom image path
  // customContent: (
  //   // Provide concrete examples of what the user can now do
  //   <ul className="list-disc ml-4 ">
  //     <li className="text-sm">
  //       "Show me senior remote frontend roles in Bangalore."
  //     </li>
  //     <li className="text-sm">
  //       "Find jobs from Google or Microsoft, minimum $150k."
  //     </li>
  //     <li className="text-sm">"Display all jobs posted in the last 7 days."</li>
  //   </ul>
  // ),
  currentDialogId: "AI_SEARCH_PROMO_V1", // Use a unique ID for this new feature tour
};

// export const featureData = null;
