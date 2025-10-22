import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateReleaseDto } from './create-release.dto';
import { ReleaseType } from '../entities/release.entity';
import {
  IsString,
  IsEnum,
  IsDateString,
  IsArray,
  IsOptional,
} from 'class-validator';

export class UpdateReleaseDto extends PartialType(CreateReleaseDto) {
  @ApiProperty({
    description: 'The title of the release',
    example: 'Vida Rockstar (Deluxe Edition)',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description:
      'Type of release. Possible values: "album" (full-length album), "single" (single song release), "ep" (extended play - shorter than album)',
    enum: ReleaseType,
    enumName: 'ReleaseType',
    example: ReleaseType.ALBUM,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReleaseType)
  type?: ReleaseType;

  @ApiProperty({
    description: 'Release date in ISO format (YYYY-MM-DD)',
    example: '2023-05-12',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @ApiProperty({
    description: 'Cover image URL',
    example: 'https://cloudinary.com/updated-cover.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiProperty({
    description: 'Array of song IDs from the songs microservice',
    example: ['song-id-1', 'song-id-2', 'song-id-3', 'song-id-4'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  songIds?: string[];
}
