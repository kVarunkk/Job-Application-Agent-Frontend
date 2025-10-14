"use server";

import { revalidateTag } from "next/cache";

/**
 * Revalidates the cache for any specified tag.
 * @param {string} tag - The cache tag to revalidate (e.g., 'jobs-feed', 'job-123').
 */
export async function revalidateCache(tag: string) {
  if (!tag) {
    // console.error("Revalidation failed: No tag provided.");
    return;
  }
  revalidateTag(tag);
  //   console.log(`Cache revalidated for tag: ${tag}`);
}
