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
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { UpdateBioDto } from './dto/update-bio.dto';
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

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Create a new artist' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Artist data with optional image',
    type: CreateArtistWithFileDto,
  })
  @ApiResponse({ status: 201, description: 'Artist created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Artist name already exists' })
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
        return this.artistsService.updateImage(artist.id, imageUrl);
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

  @Patch(':id/bio')
  @ApiOperation({ summary: 'Update artist bio and social links' })
  @ApiParam({ name: 'id', description: 'Artist UUID' })
  @ApiResponse({ status: 200, description: 'Bio updated successfully' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  updateBio(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBioDto: UpdateBioDto,
  ) {
    return this.artistsService.update(id, updateBioDto);
  }

  @Patch(':id/image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update artist profile image' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Artist UUID' })
  @ApiResponse({ status: 200, description: 'Image updated successfully' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  async updateImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = await this.fileUploadService.uploadFile(file, 'artists');
    return this.artistsService.updateImage(id, imageUrl);
  }

  @Patch(':id/cover')
  @UseInterceptors(FileInterceptor('cover'))
  @ApiOperation({ summary: 'Update artist cover image' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Artist UUID' })
  @ApiResponse({ status: 200, description: 'Cover updated successfully' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  async updateCover(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const coverUrl = await this.fileUploadService.uploadFile(file, 'artists');
    return this.artistsService.updateCover(id, coverUrl);
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
        return this.releasesService.update(release.id, { coverUrl });
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
