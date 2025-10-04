import {
  IsString,
  IsEnum,
  IsDateString,
  IsUUID,
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
    description: 'Type of release',
    enum: ReleaseType,
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
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  artistId: string;

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
