import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ReleasesService } from './releases.service';
import { Release } from './entities/release.entity';

@ApiTags('releases')
@Controller('releases')
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

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
