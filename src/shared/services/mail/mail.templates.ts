export interface MailTemplate {
  subject: string;
  html: string;
}

export const mailTemplates = {
  verificationEmail: (otp: string, email: string): MailTemplate => ({
    subject: "Verify your Drafton account",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a1a1a;">Verify your email</h2>
        <p style="color: #444;">
          Welcome to Drafton! Use the OTP below to verify your account.
          This code expires in <strong>10 minutes</strong>.
        </p>
        <div style="
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 10px;
          padding: 20px;
          background: #f4f4f4;
          text-align: center;
          border-radius: 8px;
          color: #1a1a1a;
          margin: 24px 0;
        ">
          <a href="${process.env.FRONTEND_URL}/verify-email?otp=${otp}&email=${email}">Click this link</a>
        </div>
        <p style="color: #888; font-size: 13px;">
          If you did not create a Drafton account, you can safely ignore this email.
        </p>
      </div>
    `,
  }),

  passwordResetEmail: (otp: string): MailTemplate => ({
    subject: "Reset your Drafton password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a1a1a;">Reset your password</h2>
        <p style="color: #444;">
          We received a request to reset your Drafton password.
          Use the OTP below to proceed. This code expires in <strong>60 minutes</strong>.
        </p>
        <div style="
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 10px;
          padding: 20px;
          background: #f4f4f4;
          text-align: center;
          border-radius: 8px;
          color: #1a1a1a;
          margin: 24px 0;
        ">
          ${otp}
        </div>
        <p style="color: #888; font-size: 13px;">
          If you did not request a password reset, please ignore this email.
          Your password will not be changed.
        </p>
      </div>
    `,
  }),
};
