import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';

import { SecurityService } from './security.service';
import { LoginDto } from './dto/login.dto';

@Controller('security')
export class SecurityController {
  constructor(private securityService: SecurityService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.securityService.login(loginDto);
  }
}
