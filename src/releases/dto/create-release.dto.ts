import {
  IsString,
  IsEnum,
  IsDateString,
  IsArray,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReleaseType } from '../entities/release.entity';

export class CreateReleaseDto {
  @ApiProperty({
    description: 'The title of the release',
    example: 'Vida Rockstar',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description:
      'Type of release. Possible values: "album" (full-length album), "single" (single song release), "ep" (extended play - shorter than album)',
    enum: ReleaseType,
    enumName: 'ReleaseType',
    example: ReleaseType.ALBUM,
  })
  @IsEnum(ReleaseType)
  type: ReleaseType;

  @ApiProperty({
    description: 'Release date in ISO format',
    example: '2023-05-12',
  })
  @IsDateString()
  releaseDate: string;

  @ApiProperty({
    description: 'Cover image URL',
    example: 'https://cloudinary.com/cover.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiProperty({
    description: 'Artist ID who owns this release',
    example: 'user-12345-test-67890',
    required: false,
  })
  @IsOptional()
  @IsString()
  artistId?: string;

  @ApiProperty({
    description: 'Array of song IDs from the songs microservice',
    example: ['song-id-1', 'song-id-2', 'song-id-3'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  songIds?: string[];
}
