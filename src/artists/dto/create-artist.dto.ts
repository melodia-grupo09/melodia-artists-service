import {
  IsString,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class SocialLinksDto {
  @ApiPropertyOptional({
    description: 'Instagram profile URL',
    example: 'https://instagram.com/brunomars',
  })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({
    description: 'Twitter profile URL',
    example: 'https://twitter.com/brunomars',
  })
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiPropertyOptional({
    description: 'Facebook profile URL',
    example: 'https://facebook.com/brunomars',
  })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiPropertyOptional({
    description: 'YouTube channel URL',
    example: 'https://youtube.com/brunomars',
  })
  @IsOptional()
  @IsString()
  youtube?: string;

  @ApiPropertyOptional({
    description: 'Spotify artist URL',
    example: 'https://open.spotify.com/artist/1URnnhqYAYcrqrcwql10ft',
  })
  @IsOptional()
  @IsString()
  spotify?: string;

  @ApiPropertyOptional({
    description: 'Official website URL',
    example: 'https://brunomars.com',
  })
  @IsOptional()
  @IsString()
  website?: string;
}

export class CreateArtistDto {
  @ApiProperty({
    description: 'The ID of the artist (should match the user ID)',
    example: 'user-123-456',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'The name of the artist',
    example: 'Bruno Mars',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Artist biography - supports paragraphs and line breaks',
    example:
      'Bruno Mars is an American singer, songwriter, and record producer. Known for his stage performances, retro showmanship, and for performing in a wide range of musical styles...',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Social media links for the artist',
    type: SocialLinksDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;
}
