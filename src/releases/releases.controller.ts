import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ReleasesService } from './releases.service';
import { Release } from './entities/release.entity';

@ApiTags('releases')
@Controller('releases')
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search releases by title' })
  @ApiQuery({
    name: 'query',
    required: true,
    description: 'Search query for releases',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    schema: { default: 1 },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page',
    schema: { default: 20 },
  })
  @ApiResponse({
    status: 200,
    description: 'Releases found matching the search query',
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid parameters' })
  async searchReleases(
    @Query('query') query: string,
    @Query('page', new DefaultValuePipe(1), new ParseIntPipe()) page: number,
    @Query('limit', new DefaultValuePipe(20), new ParseIntPipe())
    limit: number,
  ) {
    if (!query) {
      throw new BadRequestException('Query parameter is required');
    }
    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    return this.releasesService.search(query, limit, page);
  }

  @Get('song/:songId/cover')
  @ApiOperation({ summary: 'Get cover URL by song ID' })
  @ApiParam({
    name: 'songId',
    description: 'Song ID (MongoDB ObjectId or any string format)',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Cover URL found for the song',
    schema: {
      type: 'object',
      properties: {
        coverUrl: {
          type: 'string',
          example: 'https://res.cloudinary.com/...',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description:
      'No release found containing this song or release has no cover',
  })
  async getCoverUrlBySongId(
    @Param('songId') songId: string,
  ): Promise<{ coverUrl: string }> {
    return this.releasesService.getCoverUrlBySongId(songId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get release by ID with artist information' })
  @ApiParam({
    name: 'id',
    description: 'Release ID (UUID format)',
    example: 'b9076388-1029-4fd5-b306-5f48eb36936f',
  })
  @ApiResponse({
    status: 200,
    description: 'Release found with artist information',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format',
  })
  @ApiResponse({
    status: 404,
    description: 'Release not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Release> {
    return this.releasesService.findOne(id);
  }
}
