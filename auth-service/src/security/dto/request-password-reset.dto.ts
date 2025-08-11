import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({ example: 'user@gmail.com', description: 'User email address' })
  @IsEmail()
  email: string;
}