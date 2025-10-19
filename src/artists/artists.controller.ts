import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseUUIDPipe,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  FileInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ArtistsService } from './artists.service';
import { FileUploadService } from '../upload/file-upload.service';
import { ReleasesService } from '../releases/releases.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { CreateArtistWithFileDto } from './dto/create-artist-with-file.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { CreateReleaseDto } from '../releases/dto/create-release.dto';
import { UpdateReleaseDto } from '../releases/dto/update-release.dto';
import { ReleaseType } from '../releases/entities/release.entity';

@ApiTags('artists')
@Controller('artists')
export class ArtistsController {
  constructor(
    private readonly artistsService: ArtistsService,
    private readonly fileUploadService: FileUploadService,
    private readonly releasesService: ReleasesService,
  ) {}

  @Get('search')
  @ApiOperation({ summary: 'Search artists by name or bio' })
  @ApiQuery({
    name: 'query',
    required: true,
    description: 'Search query for artists',
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
    description: 'Artists found matching the search query',
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid parameters' })
  async searchArtists(
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

    return this.artistsService.search(query, limit, page);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Create a new artist' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Artist data with optional image',
    type: CreateArtistWithFileDto,
  })
  @ApiResponse({ status: 201, description: 'Artist created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request or artist name already exists',
  })
  async create(
    @Body() createArtistDto: CreateArtistDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const artist = await this.artistsService.create(createArtistDto);

      if (file) {
        const imageUrl = await this.fileUploadService.uploadFile(
          file,
          'artists',
        );
        return this.artistsService.updateMedia(artist.id, imageUrl);
      }

      return artist;
    } catch (error) {
      console.error('Error creating artist:', error);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get artist by ID' })
  @ApiParam({ name: 'id', description: 'Artist UUID' })
  @ApiResponse({ status: 200, description: 'Artist found' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.artistsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update artist information' })
  @ApiParam({ name: 'id', description: 'Artist UUID' })
  @ApiResponse({ status: 200, description: 'Artist updated successfully' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArtistDto: UpdateArtistDto,
  ) {
    return this.artistsService.update(id, updateArtistDto);
  }

  @Patch(':id/media')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  @ApiOperation({ summary: 'Update artist media (profile image and/or cover)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Artist UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Artist profile image',
        },
        cover: {
          type: 'string',
          format: 'binary',
          description: 'Artist cover image',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Media updated successfully' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  async updateMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    let imageUrl: string | undefined;
    let coverUrl: string | undefined;

    if (files?.image?.[0]) {
      imageUrl = await this.fileUploadService.uploadFile(
        files.image[0],
        'artists',
      );
    }

    if (files?.cover?.[0]) {
      coverUrl = await this.fileUploadService.uploadFile(
        files.cover[0],
        'artists',
      );
    }

    return this.artistsService.updateMedia(id, imageUrl, coverUrl);
  }

  @Get(':id/releases')
  @ApiOperation({ summary: 'Get artist releases (discography)' })
  @ApiParam({ name: 'id', description: 'Artist UUID' })
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
  @ApiResponse({ status: 200, description: 'Artist releases found' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  getArtistReleases(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('type') type?: ReleaseType,
    @Query('withLatestFlag') withLatestFlag?: boolean,
  ) {
    if (withLatestFlag) {
      return this.releasesService.findByArtistWithLatestFlag(id);
    }

    if (type) {
      return this.releasesService.findByArtistAndType(id, type);
    }
    return this.releasesService.findByArtist(id);
  }

  @Post(':id/releases')
  @UseInterceptors(FileInterceptor('cover'))
  @ApiOperation({ summary: 'Create a new release for the artist' })
  @ApiParam({ name: 'id', description: 'Artist UUID' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Release created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  async createRelease(
    @Param('id', ParseUUIDPipe) artistId: string,
    @Body() createReleaseDto: CreateReleaseDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      // Verify artist exists first
      await this.artistsService.findOne(artistId);

      // Add artistId to the DTO
      const releaseData = { ...createReleaseDto, artistId };
      const release = await this.releasesService.create(releaseData);

      // If there is a cover image, upload it
      if (file) {
        const coverUrl = await this.fileUploadService.uploadFile(
          file,
          'releases',
        );
        return this.releasesService.updateByArtist(artistId, release.id, {
          coverUrl,
        });
      }

      return release;
    } catch (error) {
      console.error('Error creating release:', error);
      throw error;
    }
  }

  @Get(':artistId/releases/:releaseId')
  @ApiOperation({ summary: 'Get specific release by artist and release ID' })
  @ApiParam({ name: 'artistId', description: 'Artist UUID' })
  @ApiParam({ name: 'releaseId', description: 'Release UUID' })
  @ApiResponse({ status: 200, description: 'Release found' })
  @ApiResponse({ status: 404, description: 'Release or artist not found' })
  getArtistRelease(
    @Param('artistId', ParseUUIDPipe) artistId: string,
    @Param('releaseId', ParseUUIDPipe) releaseId: string,
  ) {
    return this.releasesService.findOneByArtist(artistId, releaseId);
  }

  @Patch(':artistId/releases/:releaseId')
  @ApiOperation({ summary: 'Update release information' })
  @ApiParam({ name: 'artistId', description: 'Artist UUID' })
  @ApiParam({ name: 'releaseId', description: 'Release UUID' })
  @ApiResponse({ status: 200, description: 'Release updated successfully' })
  @ApiResponse({ status: 404, description: 'Release or artist not found' })
  updateRelease(
    @Param('artistId', ParseUUIDPipe) artistId: string,
    @Param('releaseId', ParseUUIDPipe) releaseId: string,
    @Body() updateReleaseDto: UpdateReleaseDto,
  ) {
    return this.releasesService.updateByArtist(
      artistId,
      releaseId,
      updateReleaseDto,
    );
  }

  @Patch(':artistId/releases/:releaseId/cover')
  @UseInterceptors(FileInterceptor('cover'))
  @ApiOperation({ summary: 'Update release cover image' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'artistId', description: 'Artist UUID' })
  @ApiParam({ name: 'releaseId', description: 'Release UUID' })
  @ApiResponse({ status: 200, description: 'Cover updated successfully' })
  @ApiResponse({ status: 404, description: 'Release or artist not found' })
  async updateReleaseCover(
    @Param('artistId', ParseUUIDPipe) artistId: string,
    @Param('releaseId', ParseUUIDPipe) releaseId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const coverUrl = await this.fileUploadService.uploadFile(file, 'releases');
    return this.releasesService.updateByArtist(artistId, releaseId, {
      coverUrl,
    });
  }

  @Patch(':artistId/releases/:releaseId/songs/add')
  @ApiOperation({ summary: 'Add songs to release' })
  @ApiParam({ name: 'artistId', description: 'Artist UUID' })
  @ApiParam({ name: 'releaseId', description: 'Release UUID' })
  @ApiResponse({ status: 200, description: 'Songs added successfully' })
  addSongsToRelease(
    @Param('artistId', ParseUUIDPipe) artistId: string,
    @Param('releaseId', ParseUUIDPipe) releaseId: string,
    @Body() body: { songIds: string[] },
  ) {
    return this.releasesService.addSongsByArtist(
      artistId,
      releaseId,
      body.songIds,
    );
  }

  @Patch(':artistId/releases/:releaseId/songs/remove')
  @ApiOperation({ summary: 'Remove songs from release' })
  @ApiParam({ name: 'artistId', description: 'Artist UUID' })
  @ApiParam({ name: 'releaseId', description: 'Release UUID' })
  @ApiResponse({ status: 200, description: 'Songs removed successfully' })
  removeSongsFromRelease(
    @Param('artistId', ParseUUIDPipe) artistId: string,
    @Param('releaseId', ParseUUIDPipe) releaseId: string,
    @Body() body: { songIds: string[] },
  ) {
    return this.releasesService.removeSongsByArtist(
      artistId,
      releaseId,
      body.songIds,
    );
  }

  @Delete(':artistId/releases/:releaseId')
  @ApiOperation({ summary: 'Delete release' })
  @ApiParam({ name: 'artistId', description: 'Artist UUID' })
  @ApiParam({ name: 'releaseId', description: 'Release UUID' })
  @ApiResponse({ status: 200, description: 'Release deleted successfully' })
  @ApiResponse({ status: 404, description: 'Release or artist not found' })
  removeRelease(
    @Param('artistId', ParseUUIDPipe) artistId: string,
    @Param('releaseId', ParseUUIDPipe) releaseId: string,
  ) {
    return this.releasesService.removeByArtist(artistId, releaseId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete artist' })
  @ApiParam({ name: 'id', description: 'Artist UUID' })
  @ApiResponse({ status: 200, description: 'Artist deleted successfully' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.artistsService.remove(id);
  }
}
