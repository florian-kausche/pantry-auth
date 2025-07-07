import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'usuario@gmail.com', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678', description: 'Password' })
  @IsString()
  password: string;

}
