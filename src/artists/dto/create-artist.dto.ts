import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArtistDto {
  @ApiProperty({
    description: 'The name of the artist',
    example: 'Bruno Mars',
  })
  @IsString()
  name: string;
}
