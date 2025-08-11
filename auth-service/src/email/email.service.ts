import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as sgMail from '@sendgrid/mail';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly provider: 'smtp' | 'sendgrid' | 'ses';
  private transporter?: nodemailer.Transporter;
  private sesClient?: SESClient;
  private fromAddress: string;
  private logOtp: boolean;
  private sendDisabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.provider = (this.configService.get<string>('EMAIL_PROVIDER') as any) || 'smtp';
    this.fromAddress = this.configService.get<string>('EMAIL_FROM') || this.configService.get<string>('SENDGRID_FROM') || this.configService.get<string>('SMTP_FROM') || 'no-reply@example.com';
    this.logOtp = (this.configService.get<string>('EMAIL_LOG_OTP') || 'false') === 'true';
    this.sendDisabled = (this.configService.get<string>('EMAIL_SEND_DISABLE') || 'false') === 'true';

    if (this.provider === 'smtp') {
      const host = this.configService.get<string>('SMTP_HOST');
      const port = Number(this.configService.get<string>('SMTP_PORT') || 587);
      const secure = (this.configService.get<string>('SMTP_SECURE') || 'false') === 'true';
      const user = this.configService.get<string>('SMTP_USER');
      const pass = this.configService.get<string>('SMTP_PASS');

      if (!host || !user || !pass) {
        this.logger.warn('SMTP is selected but SMTP_HOST/SMTP_USER/SMTP_PASS are not fully configured');
      }

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: user && pass ? { user, pass } : undefined,
      } as any);
    } else if (this.provider === 'sendgrid') {
      const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
      if (!apiKey) {
        this.logger.warn('SendGrid is selected but SENDGRID_API_KEY is not configured');
      } else {
        sgMail.setApiKey(apiKey);
      }
    } else if (this.provider === 'ses') {
      const region = this.configService.get<string>('AWS_REGION');
      if (!region) {
        this.logger.warn('SES is selected but AWS_REGION is not configured');
      }
      this.sesClient = new SESClient({ region });
    }
  }

  async sendPasswordResetOtp(email: string, otp: string): Promise<void> {
    if (this.logOtp) {
      this.logger.warn(`DEV OTP for ${email}: ${otp}`);
    }

    if (this.sendDisabled) {
      this.logger.log('EMAIL_SEND_DISABLE=true; skipping actual email send');
      return;
    }

    const subject = 'Password Reset OTP';
    const html = `
      <h2>Password Reset</h2>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This code expires in 10 minutes.</p>
    `;

    if (this.provider === 'smtp') {
      if (!this.transporter) {
        throw new Error('SMTP transporter not configured');
      }
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: email,
        subject,
        html,
      });
      return;
    }

    if (this.provider === 'sendgrid') {
      await sgMail.send({
        from: this.fromAddress,
        to: email,
        subject,
        html,
      } as any);
      return;
    }

    if (this.provider === 'ses') {
      if (!this.sesClient) {
        throw new Error('SES client not configured');
      }
      const command = new SendEmailCommand({
        Source: this.fromAddress,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: html, Charset: 'UTF-8' },
          },
        },
      });
      await this.sesClient.send(command);
      return;
    }

    throw new Error('Unsupported email provider');
  }
}
