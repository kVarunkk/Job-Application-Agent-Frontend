"use server";

import { deductUserCreditsHelper } from "@/helpers/ai/deduct-user-credits";
import { eventCaptureServer } from "@/helpers/posthog/EventCaptureServer";
import { eventCaptureServerException } from "@/helpers/posthog/EventCaptureServerException";
import { createClient } from "@/lib/supabase/server";
import { PostHogEvent, TAICredits } from "@/utils/types";
import { after } from "next/server";

export async function deductApplicationCreditsAction(
  jobId: string,
  event: PostHogEvent,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false };
  }

  try {
    await deductUserCreditsHelper(
      supabase,
      user.id,
      TAICredits.JOB_APPLICATION,
    );

    after(async () => {
      try {
        await eventCaptureServer({
          event,
          distinctId: user.id,
          properties: { job_id: jobId },
        });
      } catch {}
    });

    return { success: true };
  } catch (error) {
    await eventCaptureServerException({
      error,
      distinctId: user.id,
      properties: { flow: "deduct_application_credits", job_id: jobId },
    });
    return { success: false };
  }
}
