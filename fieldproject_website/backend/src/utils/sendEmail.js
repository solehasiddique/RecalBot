import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    if (!to) throw new Error("Recipient email is missing");

    const info = await transporter.sendMail({
      from: `"RecallBot" <${process.env.MAIL_USER}>`, // must be a valid email
      to, // <-- THIS MUST BE DEFINED
      subject,
      text,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
    console.error("🔥 EMAIL ERROR:", err);
  }
};
