import { BrevoClient } from "@getbrevo/brevo";
import { Resend } from "resend";

export async function sendEmail({
  toEmail,
  subject,
  htmlContent,
  textContent,
}: {
  toEmail: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}) {
  const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY || "" });

  try {
    // 1. Proactively check if Brevo has daily credits remaining
    const accountInfo = await brevo.account.getAccount();

    // Find the relevant plan (credits can be in 'plan' array or 'relay' depending on configuration)
    const dailyPlan = accountInfo.plan?.find((p) => p.type === "free");
    const creditsRemaining = dailyPlan ? dailyPlan.credits : 0;

    console.log("daily plan: ", dailyPlan);

    // 2. If out of credits, force-throw an error to jump straight to Resend
    if (creditsRemaining !== undefined && creditsRemaining <= 0) {
      throw new Error("Brevo daily limit reached");
    }

    // 3. Otherwise, proceed with Brevo
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent,
      sender: { name: "Varun from GetHired", email: "varun@devhub.co.in" },
      to: [{ email: toEmail }],
    });
    console.log("Sent via Brevo:", result);
  } catch (brevoError) {
    console.error(
      "Brevo failed or limit reached, trying Resend fallback:",
      brevoError,
    );

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "GetHired <varun@devhub.co.in>",
        to: [toEmail],
        subject,
        html: htmlContent,
        text: textContent,
      });
      console.log("Successfully sent via Resend fallback");
    } catch (resendError) {
      console.error("Resend fallback also failed:", resendError);
      throw new Error(`Email delivery failed to ${toEmail}: ${resendError}`);
    }
  }
}

export const sendEmailForStatusUpdate = async (emailText: string) => {
  try {
    await sendEmail({
      toEmail: "varunkumawatleap2@gmail.com",
      subject: `Important: Status Update`,
      htmlContent: `<p>${emailText}</p>`,
      textContent: emailText,
    });
  } catch {
    console.error(
      "Some error occured while sending status update email to Varun Kumawat",
    );
  }
};
