import nodemailer from "nodemailer";
import {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
} from "../config/env.js";

if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_FROM) {
  throw new Error(
    "Email configuration is required for sendEmail utility. Set EMAIL_HOST, EMAIL_PORT, and EMAIL_FROM in your environment.",
  );
}

const transportOptions: any = {
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
};

if (EMAIL_USER && EMAIL_PASS) {
  transportOptions.auth = {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  };
}

const transporter = nodemailer.createTransport(transportOptions);

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
  await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
};
