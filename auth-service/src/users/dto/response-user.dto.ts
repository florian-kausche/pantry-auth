import { ApiProperty } from '@nestjs/swagger';

export class UserResponseBodyDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  expirationToken?: number;

  @ApiProperty()
  token?: string;

  @ApiProperty()
  kktoken?: string;
}
