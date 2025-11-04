// Uses the createClient from "@/lib/supabase/server"
import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

export async function ensureUserRecordExists(user: User | null): Promise<void> {
  if (!user) {
    return;
  }

  const supabase = await createClient();
  const userId = user.id;

  const { data: userData } = await supabase
    .from("user_info")
    .select("user_id")
    .eq("user_id", userId)
    .limit(1);

  if (userData && userData.length > 0) {
    return;
  }

  const { data: companyData } = await supabase
    .from("company_info")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (companyData && companyData.length > 0) {
    return;
  }

  const { error: insertError } = await supabase.from("user_info").insert({
    user_id: userId,
    email: user.email,
    is_job_digest_active: true,
    is_promotion_active: true,
  });

  if (insertError) {
    console.error(
      "Failed to insert new user_info row during post-auth:",
      insertError
    );
  }
}
