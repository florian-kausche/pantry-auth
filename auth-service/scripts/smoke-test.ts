import 'reflect-metadata';
import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { SecurityController } from '../src/security/security.controller';
import { SecurityService } from '../src/security/security.service';
import { EmailService } from '../src/email/email.service';
import { UsersService } from '../src/users/users.service';
import { TokenService } from '../src/users/token.service';

const supertest = require('supertest');

class InMemoryUserDoc {
  constructor(public data: any, private store: Map<string, any>) {}
  get id() { return this.data.id; }
  get email() { return this.data.email; }
  get password() { return this.data.password; }
  set password(v: string) { this.data.password = v; }

  get token() { return this.data.token; }
  set token(v: string) { this.data.token = v; }

  get expirationToken() { return this.data.expirationToken; }
  set expirationToken(v: Date) { this.data.expirationToken = v; }

  get passwordResetOtpHash() { return this.data.passwordResetOtpHash; }
  set passwordResetOtpHash(v: string | undefined) { this.data.passwordResetOtpHash = v; }

  get passwordResetOtpExpiresAt() { return this.data.passwordResetOtpExpiresAt; }
  set passwordResetOtpExpiresAt(v: Date | undefined) { this.data.passwordResetOtpExpiresAt = v; }

  get passwordResetOtpAttempts() { return this.data.passwordResetOtpAttempts; }
  set passwordResetOtpAttempts(v: number | undefined) { this.data.passwordResetOtpAttempts = v as any; }

  get passwordResetVerified() { return this.data.passwordResetVerified; }
  set passwordResetVerified(v: boolean | undefined) { this.data.passwordResetVerified = v as any; }

  get passwordResetToken() { return this.data.passwordResetToken; }
  set passwordResetToken(v: string | undefined) { this.data.passwordResetToken = v; }

  get passwordResetTokenExpiresAt() { return this.data.passwordResetTokenExpiresAt; }
  set passwordResetTokenExpiresAt(v: Date | undefined) { this.data.passwordResetTokenExpiresAt = v; }

  async save() { this.store.set(this.data.email, this.data); }
  toObject() { return { ...this.data }; }
}

class InMemoryUsersService {
  private users = new Map<string, any>();
  constructor() {
    const email = process.env.SEED_USER_EMAIL || 'demo@example.com';
    const password = process.env.SEED_USER_PASSWORD || 'Password123';
    const hashed = bcrypt.hashSync(password, 10);
    this.users.set(email, { id: 'u1', email, password: hashed, isActive: true });
  }
  async findByEmail(email: string) {
    const data = this.users.get(email);
    if (!data) return null;
    return new InMemoryUserDoc({ ...data }, this.users) as any;
  }
  async verifyUserExists(email: string) {
    const doc = await this.findByEmail(email);
    if (!doc) throw new NotFoundException(`No existe usuario con email: ${email}`);
    return doc as any;
  }
}

class NoopTokenService {
  async updateToken() { return; }
}

async function main() {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

  const otpCapture: { last?: string } = {};

  const moduleRef = await Test.createTestingModule({
    imports: [JwtModule.register({ secret: process.env.JWT_SECRET!, signOptions: { expiresIn: '1h' } })],
    controllers: [SecurityController],
    providers: [SecurityService,
      { provide: UsersService, useClass: InMemoryUsersService },
      { provide: TokenService, useClass: NoopTokenService },
      { provide: EmailService, useValue: { sendPasswordResetOtp: async (_email: string, otp: string) => { otpCapture.last = otp; } } },
    ],
  }).compile();

  const app: INestApplication = moduleRef.createNestApplication();
  await app.init();

  const server = app.getHttpServer();
  const email = process.env.SEED_USER_EMAIL || 'demo@example.com';

  const reqRes = await supertest(server)
    .post('/security/password-reset/request')
    .send({ email })
    .expect(201);
  console.log('Request OTP response:', reqRes.body);

  if (!otpCapture.last) throw new Error('OTP was not captured');

  const verifyRes = await supertest(server)
    .post('/security/password-reset/verify-otp')
    .send({ email, otp: otpCapture.last })
    .expect(201);
  console.log('Verify OTP response:', verifyRes.body);

  const token = verifyRes.body?.token;
  if (!token) throw new Error('Reset token not returned');

  const resetRes = await supertest(server)
    .post('/security/password-reset/reset')
    .send({ email, token, newPassword: 'NewPassword123!' })
    .expect(201);
  console.log('Reset password response:', resetRes.body);

  await app.close();
}

main().catch((err: any) => { console.error(err); process.exit(1); });