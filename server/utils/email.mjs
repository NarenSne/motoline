import { MailtrapClient } from "mailtrap";

const sendEmail = async (options) => {
  const TOKEN = process.env.MAILTRAP_TOKEN;
  const ENDPOINT = process.env.MAILTRAP_ENDPOINT;

  const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });

  const sender = {
    email: process.env.MAILTRAP_SENDER_EMAIL,
    name: process.env.MAILTRAP_SENDER_NAME,
  };

  const recipients = [
    {
      email: options.email,
    },
  ];

  const mailOptions = {
    from: sender,
    to: recipients,
    subject: options.subject,
    text: options.message,
    category: "Password Reset", // Assuming you want to categorize these emails
  };

  try {
    await client.send(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

export default sendEmail;
