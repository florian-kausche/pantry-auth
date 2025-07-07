import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  Min,
  MinLength,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'jhon@gmail.com', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'l2345678',
    description: 'Password(minimum 8 characters)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  ruku_client_id?: string;

  @IsOptional()
  @IsString()
  suscription_id?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  addressId?: string;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsNumber()
  expirationToken?: number;
}
