import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { SecurityService } from './security.service';
import { LoginDto } from './dto/login.dto';
import { UserResponseBodyDto } from 'src/users/dto/response-user.dto';
import { SignupDto } from './dto/signup.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('security')
export class SecurityController {
  constructor(private securityService: SecurityService) {}

  @Post('login')
  @ApiOperation({ summary: 'Logged in user' })
  async login(@Body() loginDto: LoginDto): Promise<UserResponseBodyDto> {
    const logged_in_user = this.securityService.login(loginDto);
    return logged_in_user;
  }

  @Post('signup')
  async signUp(@Body() signupDto: SignupDto) {
    return this.securityService.signup(signupDto);
  }

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
