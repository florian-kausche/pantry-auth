import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { SecurityService } from './security.service';
import { LoginDto } from './dto/login.dto';
import { UserResponseBodyDto } from 'src/users/dto/response-user.dto';

@Controller('security')
export class SecurityController {
  constructor(private securityService: SecurityService) {}

  @Post('login')
  @ApiOperation({ summary: 'Logged in user' })
  async login(@Body() loginDto: LoginDto): Promise<UserResponseBodyDto> {
    const logged_in_user = this.securityService.login(loginDto);
    return logged_in_user;
  }
}
