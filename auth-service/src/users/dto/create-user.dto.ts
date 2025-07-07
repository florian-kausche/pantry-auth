import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsInt, Min, MinLength } from 'class-validator';

export class CreateUserDto {

  @ApiProperty({ example: 'juan@gmail.com', description: 'Correo electrónico del usuario' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 25, description: 'Edad del usuario', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;
  
  @ApiProperty({ 
    example: '12345678', 
    description: 'Contraseña del usuario (mínimo 8 caracteres)', 
    minLength: 8 
  })
  @IsString()
  @MinLength(8)
  password: string;


}

