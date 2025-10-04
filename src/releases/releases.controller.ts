import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { ReleasesService } from './releases.service';
import { FileUploadService } from '../upload/file-upload.service';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';
import { ReleaseType } from './entities/release.entity';

@ApiTags('releases')
@Controller('releases')
export class ReleasesController {
  constructor(
    private readonly releasesService: ReleasesService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('cover'))
  @ApiOperation({ summary: 'Create a new release' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Release created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createReleaseDto: CreateReleaseDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const release = await this.releasesService.create(createReleaseDto);

      // If there is a cover image, upload it
      if (file) {
        const coverUrl = await this.fileUploadService.uploadFile(
          file,
          'releases',
        );
        return this.releasesService.update(release.id, { coverUrl });
      }

      return release;
    } catch (error) {
      console.error('Error creating release:', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all releases' })
  @ApiResponse({ status: 200, description: 'List of releases' })
  findAll() {
    return this.releasesService.findAll();
  }

  @Get('artist/:artistId')
  @ApiOperation({ summary: 'Get releases by artist ID' })
  @ApiParam({ name: 'artistId', description: 'Artist UUID' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ReleaseType,
    description: 'Filter by release type',
  })
  @ApiQuery({
    name: 'withLatestFlag',
    required: false,
    type: Boolean,
    description: 'Include isLatest flag for each release',
  })
  @ApiResponse({ status: 200, description: 'List of artist releases' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  findByArtist(
    @Param('artistId', ParseUUIDPipe) artistId: string,
    @Query('type') type?: ReleaseType,
    @Query('withLatestFlag') withLatestFlag?: boolean,
  ) {
    if (withLatestFlag) {
      return this.releasesService.findByArtistWithLatestFlag(artistId);
    }

    if (type) {
      return this.releasesService.findByArtistAndType(artistId, type);
    }
    return this.releasesService.findByArtist(artistId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get release by ID' })
  @ApiParam({ name: 'id', description: 'Release UUID' })
  @ApiResponse({ status: 200, description: 'Release found' })
  @ApiResponse({ status: 404, description: 'Release not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.releasesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update release information' })
  @ApiParam({ name: 'id', description: 'Release UUID' })
  @ApiResponse({ status: 200, description: 'Release updated successfully' })
  @ApiResponse({ status: 404, description: 'Release not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReleaseDto: UpdateReleaseDto,
  ) {
    return this.releasesService.update(id, updateReleaseDto);
  }

  @Patch(':id/cover')
  @UseInterceptors(FileInterceptor('cover'))
  @ApiOperation({ summary: 'Update release cover image' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Release UUID' })
  @ApiResponse({ status: 200, description: 'Cover updated successfully' })
  @ApiResponse({ status: 404, description: 'Release not found' })
  async updateCover(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const coverUrl = await this.fileUploadService.uploadFile(file, 'releases');
    return this.releasesService.update(id, { coverUrl });
  }

  @Patch(':id/songs/add')
  @ApiOperation({ summary: 'Add songs to release' })
  @ApiParam({ name: 'id', description: 'Release UUID' })
  @ApiResponse({ status: 200, description: 'Songs added successfully' })
  addSongs(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { songIds: string[] },
  ) {
    return this.releasesService.addSongs(id, body.songIds);
  }

  @Patch(':id/songs/remove')
  @ApiOperation({ summary: 'Remove songs from release' })
  @ApiParam({ name: 'id', description: 'Release UUID' })
  @ApiResponse({ status: 200, description: 'Songs removed successfully' })
  removeSongs(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { songIds: string[] },
  ) {
    return this.releasesService.removeSongs(id, body.songIds);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete release' })
  @ApiParam({ name: 'id', description: 'Release UUID' })
  @ApiResponse({ status: 200, description: 'Release deleted successfully' })
  @ApiResponse({ status: 404, description: 'Release not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.releasesService.remove(id);
  }
}
