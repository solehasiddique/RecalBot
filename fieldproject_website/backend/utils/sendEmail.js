import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const { error } = await resend.emails.send({
      from: "RecallBot <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("🔥 EMAIL ERROR:", error);
      throw new Error(error.message);
    }

    console.log("✅ Email sent to:", to);
  } catch (err) {
    console.error("🔥 EMAIL ERROR:", err.message);
    throw err;
  }
};