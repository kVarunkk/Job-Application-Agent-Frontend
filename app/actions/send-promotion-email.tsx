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
  content: React.ReactNode;
  ctaLink: string;
  ctaLabel: string;
  imageLink?: string;
}): Promise<{ success: boolean; count: number; error?: string }> {
  // Use the Service Role Client to bypass RLS and fetch all user data securely
  const supabase = createServiceRoleClient();

  // 1. Fetch Users Opted In
  const { data: users, error: fetchError } = await supabase
    .from("user_info")
    .select("user_id, email, full_name") // Select necessary fields
    .eq("is_promotion_active", true)
    // .eq("filled", false); // Filter for active promotions
    .eq("user_id", "e8e85c3b-b111-4f20-b2f7-06a9d3e66190");

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

// const htmlContent = (
//     <>
//       <Text>
//         We noticed you started your sign-up but haven't completed your brief
//         career profile yet. Right now, our powerful AI system can't help you
//         find the best roles—and we don't want you to miss out!
//       </Text>

//       <Heading className="text-xl font-semibold text-gray-800 my-6 text-color">
//         Here is what you unlock by finishing your profile:
//       </Heading>

//       <Section
//         style={{
//           paddingLeft: "20px",
//           backgroundColor: "#f9fafb",
//           borderRadius: "8px",
//         }}
//         className="py-4 px-6 border border-gray-200"
//       >
//         {/* Use Section or standard HTML list for better list formatting in emails */}
//         <ul style={{ margin: "0", paddingLeft: "20px", listStyleType: "disc" }}>
//           <li style={{ paddingBottom: "10px" }}>
//             <Text className="m-0">
//               <b>Hyper-Accurate AI Matching</b>: Our system needs your skills
//               and experience to find jobs that truly fit. Stop applying blindly!
//             </Text>
//           </li>

//           <li style={{ paddingBottom: "10px" }}>
//             <Text className="m-0">
//               <b>Weekly Top Jobs Digest</b>: Receive a curated email every
//               week with the most relevant, high-paying jobs just for you.
//             </Text>
//           </li>

//           <li style={{ paddingBottom: "10px" }}>
//             <Text className="m-0">
//               <b>Instant Filter Setup</b>: Automatically sets your preferred
//               salary ranges, locations, and job types.
//             </Text>
//           </li>
//         </ul>
//       </Section>

//       <Text className="mt-8">
//         It only takes 2 minutes to complete your profile and start seeing jobs
//         perfectly tailored to your goals.
//       </Text>

//       <Text>
//         Click the button below to finish your profile and unlock your
//         personalized job feed!
//       </Text>
//     </>
//   );

//   try {
//     const { success, count, error } = await sendPromotionEmails({
//       title: "Important Update: Complete Your Profile for Instant Job Matches",
//       content: htmlContent,
//       ctaLink: "https://gethired.devhub.co.in/get-started?edit=true", // 👈 Link directly to the onboarding form
//       ctaLabel: "Complete Onboarding Now",

//       // Use the GIF/Image to visually represent the benefits (e.g., jobs arriving in an inbox)
//       // imageLink:
//       //   "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/promotional_emails/onboarding-benefit-graphic.png", // Use a graphic showing 'before vs after profile'
//     });

//     console.log(success, count, error);
//   } catch (e) {
//     console.error(e);
//   }
