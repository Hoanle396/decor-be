import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, NotEquals } from 'class-validator';

import { Role } from '../../role/user.enum';
export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  roles: Role;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
