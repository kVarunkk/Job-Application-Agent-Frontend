import { createVertex } from "@ai-sdk/google-vertex";
import fs from "fs/promises";
import path from "path";

export async function getVertexClient() {
  const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;

  if (!credentialsJson) {
    throw new Error("GOOGLE_CREDENTIALS_JSON environment variable is not set.");
  }

  // Create a temporary file in the /tmp directory
  const tempFilePath = path.join("/tmp", "credentials.json");

  try {
    // console.log(JSON.parse(`"${credentialsJson}"`));
    // Write the JSON string to the temporary file
    await fs.writeFile(tempFilePath, JSON.parse(`"${credentialsJson}"`));
    // console.log("Successfully wrote credentials to temporary file.");
  } catch {
    // console.error("Failed to write temporary credentials file:", error);
    throw new Error("Failed to set up credentials for Vertex AI.");
  }

  // Set the environment variable to the path of the temporary file
  process.env.GOOGLE_APPLICATION_CREDENTIALS = tempFilePath;

  // Now, create the Vertex client with the configured environment
  return createVertex({
    project: "mern-twitter-368919",
    location: "us-central1",
  });
}

export function getCutOffDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  // this helps the /api/jobs endpoint to cache results by date only (ignoring time)
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}

// export const featureData = {
//   title: "New Feature: Ultra-Fast Filters!",
//   description:
//     "We've upgraded our search engine. Click continue to enjoy instant filtering results across your job feed.",
//   confirmButtonLabel: "Continue to Dashboard",
//   featureHighlight: "🚀 AI Job Search is now 10x faster!",
//   promoImage:
//     "/images/posts/how-to-attract-top-talent-to-your-company-s-remote-team/image.jpg",
//   customContent: (
//     <ul className="list-disc ml-4 ">
//       <li>Instant filtering on Salary & Location.</li>
//       <li>Better mobile responsiveness.</li>
//     </ul>
//   ),
//   currentDialogId: "FEATURE_TOUR_V3",
// };

export const featureData = null;
