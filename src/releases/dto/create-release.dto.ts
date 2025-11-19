import {
  IsString,
  IsEnum,
  IsDateString,
  IsArray,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReleaseType, ReleaseStatus } from '../entities/release.entity';

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
    description: 'Release status',
    enum: ReleaseStatus,
    enumName: 'ReleaseStatus',
    example: ReleaseStatus.DRAFT,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReleaseStatus)
  status?: ReleaseStatus;

  @ApiProperty({
    description: 'Release date in ISO format',
    example: '2023-05-12',
  })
  @IsDateString()
  releaseDate: string;

  @ApiProperty({
    description: 'Scheduled publish date and time (for programmed releases)',
    example: '2023-05-12T15:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledPublishAt?: string;

  @ApiProperty({
    description: 'Music genres',
    example: ['reggaeton', 'latin-trap'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  @ApiProperty({
    description: 'Cover image URL',
    example: 'https://cloudinary.com/cover.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  coverUrl?: string;

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
