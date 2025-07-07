import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate } from 'class-validator';

export class UpdateTokenDto {
  @ApiProperty({ example: 'jwt_token_here', description: 'JWT access token' })
  @IsString()
  token: string;

  @ApiProperty({ example: new Date(), description: 'Expiration date for token' })
  expirationToken?: Date;
}
