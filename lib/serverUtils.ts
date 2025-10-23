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
