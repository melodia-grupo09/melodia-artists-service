import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateArtistWithFileDto {
  @ApiProperty({
    description: 'The ID of the artist (should match the user ID)',
    example: 'user-123-456',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'The name of the artist',
    example: 'J Balvin',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Artist biography - supports paragraphs and line breaks',
    example: 'J Balvin is a Colombian reggaeton singer...',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Social media links for the artist (JSON string)',
    example:
      '{"instagram":"https://instagram.com/jbalvin","spotify":"https://open.spotify.com/artist/1vyhD5VmyZ7KMfW5gqLgo5"}',
  })
  @IsOptional()
  @IsString()
  socialLinks?: string;

  @ApiProperty({
    description: 'Artist profile image',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  image?: any;
}
