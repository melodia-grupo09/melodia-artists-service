import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateArtistWithFileDto {
  @ApiProperty({
    description: 'The name of the artist',
    example: 'J Balvin',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Artist profile image',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  image?: any;
}
