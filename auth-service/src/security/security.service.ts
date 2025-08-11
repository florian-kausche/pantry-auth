import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import { UsersService } from '../users/users.service';
import { TokenService } from 'src/users/token.service';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class SecurityService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokenService: TokenService,
    private emailService: EmailService,
  ) {}

  async logout(authorizationHeader?: string) {
    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }
    const parts = authorizationHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization header');
    }
    const token = parts[1];

    const decoded = this.jwtService.verify(token);
    const userId = decoded?.sub;
    if (!userId) {
      throw new UnauthorizedException('Invalid token');
    }

    await this.tokenService.updateToken(userId, { token: '' });
    return { message: 'Logged out successfully' };
  }

  private generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const user = await this.usersService.verifyUserExists(dto.email);

    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.passwordResetOtpHash = otpHash;
    user.passwordResetOtpExpiresAt = expiresAt;
    user.passwordResetOtpAttempts = 0;
    user.passwordResetVerified = false;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;

    await user.save();

    await this.emailService.sendPasswordResetOtp(user.email, otp);

    return { message: 'OTP sent successfully', email: user.email };
  }

  async verifyPasswordResetOtp(dto: VerifyOtpDto) {
    const user = await this.usersService.verifyUserExists(dto.email);

    if (!user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt) {
      throw new NotFoundException('OTP not found or expired');
    }

    if (new Date() > new Date(user.passwordResetOtpExpiresAt)) {
      // Expired
      user.passwordResetOtpHash = undefined;
      user.passwordResetOtpExpiresAt = undefined;
      user.passwordResetOtpAttempts = 0;
      await user.save();
      throw new BadRequestException('OTP has expired');
    }

    if ((user.passwordResetOtpAttempts ?? 0) >= 3) {
      user.passwordResetOtpHash = undefined;
      user.passwordResetOtpExpiresAt = undefined;
      user.passwordResetOtpAttempts = 0;
      await user.save();
      throw new BadRequestException('Too many attempts. Please request a new OTP');
    }

    const isValid = await bcrypt.compare(dto.otp, user.passwordResetOtpHash);
    if (!isValid) {
      user.passwordResetOtpAttempts = (user.passwordResetOtpAttempts ?? 0) + 1;
      await user.save();
      throw new BadRequestException('Invalid OTP');
    }

    user.passwordResetVerified = true;

    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'password_reset' },
      { expiresIn: '15m' },
    );
    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    return { message: 'OTP verified successfully', token: resetToken };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.verifyUserExists(dto.email);

    if (!user.passwordResetVerified || !user.passwordResetToken || !user.passwordResetTokenExpiresAt) {
      throw new BadRequestException('Invalid or unverified reset request');
    }

    // Verify token signature and expiry
    let decoded: any;
    try {
      decoded = this.jwtService.verify(dto.token);
    } catch (e) {
      throw new ForbiddenException('Invalid or expired token');
    }

    if (decoded.sub !== user.id || decoded.type !== 'password_reset') {
      throw new ForbiddenException('Invalid token');
    }

    if (new Date() > new Date(user.passwordResetTokenExpiresAt)) {
      throw new ForbiddenException('Reset token expired');
    }

    if (!dto.newPassword || dto.newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    user.password = hashedPassword;

    // Clear reset state
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpiresAt = undefined;
    user.passwordResetOtpAttempts = 0;
    user.passwordResetVerified = false;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;

    // Also log out existing sessions
    user.token = '';
    user.expirationToken = Date.now();

    await user.save();

    return { message: 'Password reset successfully' };
  }
}
