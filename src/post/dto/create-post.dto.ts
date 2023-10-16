import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
  })
  @IsOptional()
  files: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    type: 'number',
    required: true,
  })
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  category: string;
}
