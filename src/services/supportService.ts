import { AppError } from "../utils/AppError.js";
import { sendEmail } from "../utils/sendEmail.js";

const supportService = {
  report: async ({
    name,
    email,
    messageType,
    message,
  }: {
    name: string;
    email: string;
    messageType: string;
    message: string;
  }) => {
    if (!name || !email || !messageType || !message) {
      throw new AppError("All fields are required", 400);
    }

    await sendEmail({
      to: process.env.EMAIL_FROM || "support@example.com",
      subject: `Help Center Report: ${messageType}`,
      text: `Name: ${name}\nEmail: ${email}\nType: ${messageType}\nMessage:\n${message}`,
      html: `
        <h2>Help Center Report</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Type:</strong> ${messageType}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br />")}</p>
      `,
    });
  },
};

export default supportService;
