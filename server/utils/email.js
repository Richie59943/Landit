const nodemailer = require("nodemailer");

const requiredEmailEnv = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "EMAIL_FROM",
];

const isEmailConfigured = () =>
  requiredEmailEnv.every((key) => Boolean(process.env[key]));

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  if (!isEmailConfigured()) {
    throw new Error("Password reset email is not configured");
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Reset your Landit password",
    text: `Use this link to reset your Landit password: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <h2>Reset your Landit password</h2>
        <p>Use the button below to create a new password. This link expires in 1 hour.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 16px; background: #0284c7; color: #ffffff; text-decoration: none; border-radius: 8px;">
            Reset password
          </a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
};

module.exports = {
  isEmailConfigured,
  sendPasswordResetEmail,
};
