import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateArtistDto } from './create-artist.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateArtistDto extends PartialType(CreateArtistDto) {
  @ApiProperty({
    description: 'The name of the artist',
    example: 'J Balvin',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Biography of the artist',
    example: 'Colombian reggaeton singer, songwriter, and record producer.',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: 'Social media links and other URLs',
    example: {
      instagram: 'https://instagram.com/jbalvin',
      twitter: 'https://twitter.com/jbalvin',
      spotify: 'https://open.spotify.com/artist/1vyhD5VmyZ7KMfW5gqLgo5',
      youtube: 'https://youtube.com/c/JBalvinOfficial',
      website: 'https://jbalvin.com',
    },
    required: false,
  })
  @IsOptional()
  socialLinks?: Record<string, string>;
}
