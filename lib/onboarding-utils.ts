// Uses the createClient from "@/lib/supabase/server"
import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

/**
 * Checks if a user exists in EITHER user_info or company_info.
 * If not found in either, inserts a record into user_info.
 * This function should be called immediately after sign-in/OAuth completion.
 */
export async function ensureUserRecordExists(user: User | null): Promise<void> {
  if (!user) {
    // Should not happen post-auth, but safety check
    return;
  }

  const supabase = await createClient();
  const userId = user.id;

  // 1. Check user_info
  const { data: userData } = await supabase
    .from("user_info")
    .select("user_id")
    .eq("user_id", userId)
    .limit(1);

  if (userData && userData.length > 0) {
    // User already exists in user_info. Nothing to do.
    return;
  }

  // 2. Check company_info (Crucial to prevent dual creation if they signed up as a company previously)
  const { data: companyData } = await supabase
    .from("company_info")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (companyData && companyData.length > 0) {
    // User is a company user. Nothing to do (the database is correct).
    return;
  }

  // 3. If user is NOT found in either table (First-time OAuth Login)
  // We insert into user_info since this flow is designated for job seekers.
  //   console.log(`Inserting new user record for ID: ${userId}`);

  const { error: insertError } = await supabase.from("user_info").insert({
    user_id: userId,
    is_job_digest_active: true,
    is_promotion_active: true,
  });

  if (insertError) {
    // Log the failure but do not crash the page
    console.error(
      "Failed to insert new user_info row during post-auth:",
      insertError
    );
  }
}
