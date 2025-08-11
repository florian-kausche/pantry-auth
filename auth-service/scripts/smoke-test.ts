import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { EmailService } from '../src/email/email.service';
const supertest = require('supertest');

async function main() {
  process.env.MONGODB_MEMORY = 'true';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
  process.env.PORT = process.env.PORT || '0';
  process.env.EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'smtp';
  process.env.EMAIL_SEND_DISABLE = 'true';
  process.env.EMAIL_LOG_OTP = 'true';
  process.env.SEED_USER_EMAIL = process.env.SEED_USER_EMAIL || 'demo@example.com';
  process.env.SEED_USER_PASSWORD = process.env.SEED_USER_PASSWORD || 'Password123';

  const otpCapture: { last?: string } = {};

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailService)
    .useValue({
      sendPasswordResetOtp: async (email: string, otp: string) => {
        otpCapture.last = otp;
      },
    })
    .compile();

  const app: INestApplication = moduleRef.createNestApplication();
  await app.init();

  const server = app.getHttpServer();

  const email = process.env.SEED_USER_EMAIL!;

  // Request OTP
  const reqRes = await supertest(server)
    .post('/security/password-reset/request')
    .send({ email })
    .expect(201);
  console.log('Request OTP response:', reqRes.body);

  if (!otpCapture.last) {
    throw new Error('OTP was not captured');
  }

  // Verify OTP
  const verifyRes = await supertest(server)
    .post('/security/password-reset/verify-otp')
    .send({ email, otp: otpCapture.last })
    .expect(201);
  console.log('Verify OTP response:', verifyRes.body);

  const token = verifyRes.body?.token;
  if (!token) {
    throw new Error('Reset token not returned');
  }

  // Reset password
  const resetRes = await supertest(server)
    .post('/security/password-reset/reset')
    .send({ email, token, newPassword: 'NewPassword123!' })
    .expect(201);
  console.log('Reset password response:', resetRes.body);

  await app.close();
}

main().catch((err: any) => {
  console.error(err);
  process.exit(1);
});