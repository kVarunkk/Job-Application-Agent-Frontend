"use server";

import { Resend } from "resend";
import { render } from "@react-email/components";
import { PromotionEmail } from "@/emails/PromotionEmail";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a promotional email to all users who have 'is_promotion_active' set to true.
 * @param promoDetails Object containing the content for the email.
 * @returns Object indicating success or failure.
 */
export async function sendPromotionEmails(promoDetails: {
  title: string;
  content: string;
  ctaLink: string;
  ctaLabel: string;
  imageLink: string;
}): Promise<{ success: boolean; count: number; error?: string }> {
  // Use the Service Role Client to bypass RLS and fetch all user data securely
  const supabase = createServiceRoleClient();

  // 1. Fetch Users Opted In
  const { data: users, error: fetchError } = await supabase
    .from("user_info")
    .select("user_id, email, full_name") // Select necessary fields
    .eq("is_promotion_active", true); // Filter for active promotions
  // .eq("user_id", "e63c275d-bd11-43d1-9db8-58afd9c1cfbc");

  if (fetchError) {
    console.error("Error fetching promotional users:", fetchError);
    return { success: false, count: 0, error: fetchError.message };
  }

  if (!users || users.length === 0) {
    return {
      success: true,
      count: 0,
      error: "No active users found for promotion.",
    };
  }

  // 2. Prepare Email Sending Promises
  const emailPromises = users.map(async (user) => {
    // NOTE: Replace 'name' with a fallback if your user_info table doesn't have a 'name' field
    const userName = user.full_name || user.email.split("@")[0];

    const emailHtml = await render(
      <PromotionEmail
        userName={userName}
        emailTitle={promoDetails.title}
        mainContent={promoDetails.content}
        gifPreviewImageUrl={promoDetails.imageLink}
        ctaLink={promoDetails.ctaLink}
        ctaLabel={promoDetails.ctaLabel}
      />
    );

    // FIX: Standardize the return structure for both success and failure
    try {
      await resend.emails.send({
        from: "GetHired <varun@devhub.co.in>", // Use a dedicated sender
        to: [user.email],
        subject: promoDetails.title,
        html: emailHtml,
      });

      // Standardized success return
      return { success: true, email: user.email };
    } catch (err) {
      // Catch individual send failures and allow others to continue
      console.error(`Failed to send email to ${user.email}:`, err);
      // Standardized failure return
      return { success: false, email: user.email };
    }
  });

  // 3. Execute all sends in parallel
  const results = await Promise.all(emailPromises);
  console.log(results);
  const successCount = results.filter((r) => r.success).length;

  return { success: true, count: successCount };
}

// LAST PROMOTION CONTENT

// try {
//   const { success, count, error } = await sendPromotionEmails({
//     title: "Find Jobs 10x Faster: Introducing AI Natural Search!",
//     content: `
//       We are thrilled to announce the launch of our new AI-powered search feature!
//       You can now skip the complex filters and simply tell our system exactly what
//       you are looking for in natural language.

//       Our AI instantly processes queries like: "Remote Python jobs in NYC with visa sponsorship"
//       and builds the filters for you, delivering hyper-accurate results immediately.

//       Click the link below to see the new search experience in action and
//       start finding your perfect job without friction.
//   `,
//     ctaLink: "https://gethired.devhub.co.in/jobs", // Link to the main job search page
//     ctaLabel: "Try AI Search Now",

//     // NEW VIDEO/GIF PROPERTIES
//     // videoPageUrl: "https://gethired.devhub.co.in/new-feature-video", // Link to your video landing page
//     imageLink:
//       "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/promotional_emails/ai-job-search-feature.gif", // Your hosted GIF URL
//   });

//   console.log(success, count, error);
// } catch (e) {
//   console.error(e);
// }
