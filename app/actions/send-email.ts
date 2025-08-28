"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendStatusUpdateEmail(
  email: string,
  newStatus: string,
  jobTitle: string,
  companyName: string
) {
  try {
    const { error } = await resend.emails.send({
      from: "GetHired <varun@devhub.co.in>",
      to: [email],
      subject: `Update: Your Application Status for ${jobTitle} at ${companyName}`,
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #007BFF;">Application Status Update</h2>
      <p>Hello,</p>
      <p>We're writing to let you know that there has been an update to your application for the <strong>${jobTitle}</strong> role at <strong>${companyName}</strong>.</p>
      <p>Your new application status is: <strong>${newStatus}</strong>.</p>
      <p>To view the full details and track your application, please visit your dashboard.</p>
      <p style="margin-top: 20px;">
        <a href="https://gethired.devhub.co.in/jobs" style="background-color: #007BFF; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">
          View My Applications
        </a>
      </p>
      <p>Best regards,<br>The GetHired Team</p>
    </div>
  `,
    });

    if (error) {
      console.error("Resend email error:", error);
      throw new Error("Failed to send email");
    }

    return { success: true };
  } catch (err) {
    console.error("Error sending email:", err);
    return { success: false, error: "Failed to send email" };
  }
}
