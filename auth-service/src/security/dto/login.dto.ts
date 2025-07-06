import { ApiProperty } from '@nestjs/swagger';


import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'usuario@gmail.com', description: 'Correo electrónico del usuario' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678', description: 'Contraseña del usuario' })
  @IsString()
  password: string;
}
