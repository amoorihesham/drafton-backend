import { IMailService } from "../../core/shared/interfaces/mail.service.interface";

export interface MailServiceConfig {
  hostEmail: string;
  hostPassword: string;
  hostPort: number;
  hostSecure: boolean;
}

export class MailService implements IMailService {
  constructor(private readonly config: MailServiceConfig) {}

  async sendVerificationEmail(email: string, token: string): Promise<void> {}

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {}

  
}
