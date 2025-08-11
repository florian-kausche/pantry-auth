import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@gmail.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'reset_token_here', description: 'Token returned after OTP verification' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'newStrongPassword123', description: 'New password (min 8 chars)' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}