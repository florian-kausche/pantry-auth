import { Controller, Post, Body } from '@nestjs/common';

import { SecurityService } from './security.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('security')
export class SecurityController {
  constructor(private securityService: SecurityService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.securityService.login(loginDto);
  }

  @Post('signup')
  async signUp(@Body() signupDto: SignupDto) {
    return this.securityService.signup(signupDto);
  }
}
