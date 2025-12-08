import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class GetLatestReleaseDto {
  @ApiProperty({
    description: 'List of artist IDs to search for the latest release',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '987fcdeb-51a2-43f7-9abc-426614174000',
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  artistIds: string[];
}
