import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { SecurityService } from './security.service';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('security')
export class SecurityController {
  constructor(private securityService: SecurityService) {}

  @Post('logout')
  @ApiOperation({ summary: 'Logout user by invalidating JWT token' })
  async logout(@Headers('authorization') authorization?: string) {
    return this.securityService.logout(authorization);
  }

  @Post('password-reset/request')
  @ApiOperation({ summary: 'Request password reset OTP' })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.securityService.requestPasswordReset(dto);
  }

  @Post('password-reset/verify-otp')
  @ApiOperation({ summary: 'Verify OTP for password reset' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.securityService.verifyPasswordResetOtp(dto);
  }

  @Post('password-reset/reset')
  @ApiOperation({ summary: 'Reset password using verified token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.securityService.resetPassword(dto);
  }
}
