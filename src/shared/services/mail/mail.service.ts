import nodemailer, { Transporter } from "nodemailer";
import { IMailService } from "./mail.service.interface.js";
import { mailTemplates } from "./mail.templates.js";
import { InternalServerException } from "../../errors/http.errors.js";
import { MAIL_ERRORS, MAIL_MESSAGES } from "./mail.constants.js";

export interface MailServiceConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export class MailService implements IMailService {
  private readonly transporter: Transporter;

  constructor(private readonly config: MailServiceConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: false,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  async sendVerificationEmail(email: string, otp: string): Promise<void> {
    await this.send(email, mailTemplates.verificationEmail(otp,email));
  }

  async sendPasswordResetEmail(email: string, otp: string): Promise<void> {
    await this.send(email, mailTemplates.passwordResetEmail(otp));
  }

  // ─── Private ────────────────────────────────────────────────

  private async send(
    to: string,
    template: { subject: string; html: string },
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.from,
        to,
        subject: template.subject,
        html: template.html,
      });
    } catch (error) {
      throw new InternalServerException(
        MAIL_MESSAGES.MAIL_SEND_FAILED,
        MAIL_ERRORS.MAIL_SEND_FAILED,
      );
    }
  }
}
