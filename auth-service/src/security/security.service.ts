import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';
import { TokenService } from 'src/users/token.service';
import { LoginDto } from './dto/login.dto';
import { UserResponseBodyDto } from 'src/users/dto/response-user.dto'; 

@Injectable()
export class SecurityService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokenService: TokenService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
  }

  async login(loginDto: LoginDto): Promise<UserResponseBodyDto> {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      if (!user) {
        throw new UnauthorizedException('Email o contraseña incorrectos');
      }

      const payload = { email: user.email, sub: user._id };
      const access_token = this.jwtService.sign(payload);

      await this.tokenService.updateToken(user.id, {token: access_token})

      const { _id, password, __v, ...responseBody } = user.toObject();

      return responseBody
      
    } catch (error) {
      throw error;
    }
  }


}
