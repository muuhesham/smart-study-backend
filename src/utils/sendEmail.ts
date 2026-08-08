import { Resend } from "resend";
import { EMAIL_PASS, EMAIL_FROM } from "../config/env.js";

if (!EMAIL_PASS || !EMAIL_FROM) {
  throw new Error(
    "Email configuration is required for sendEmail utility. Set EMAIL_PASS and EMAIL_FROM in your environment.",
  );
}

const resend = new Resend(EMAIL_PASS);

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: SendEmailOptions) => {
  try {
    const emailPayload: any = {
      from: EMAIL_FROM,
      to,
      subject,
      ...(html ? { html } : { text: text || "" }),
    };

    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      console.error("❌ Resend API Error:", error);
      throw new Error(error.message);
    }

    console.log("✉️ Email sent via Resend API. ID:", data?.id);
    return data;
  } catch (error) {
    console.error("❌ Error sending email via Resend:", error);
    throw error;
  }
};
