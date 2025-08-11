import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendPasswordResetOtp(email: string, otp: string): Promise<void> {
    // In production, integrate a real email provider here (e.g., SES, SendGrid)
    this.logger.log(`Sending OTP ${otp} to ${email}`);
  }
}
