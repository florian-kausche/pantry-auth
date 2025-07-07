import { Controller, Post, Body } from '@nestjs/common';

import { SecurityService } from './security.service';
import { LoginDto } from './dto/login.dto';
import { UserResponseBodyDto } from 'src/users/dto/response-user.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('security')
export class SecurityController {
  constructor(private securityService: SecurityService) {}

  @Post('login')
  @ApiOperation({ summary: 'Update user token' })
  @ApiResponse({ status: 200, description: 'Token updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async login(@Body() loginDto: LoginDto): Promise<UserResponseBodyDto> {
    const logged_in_user = this.securityService.login(loginDto);
    return logged_in_user;
  }
}
