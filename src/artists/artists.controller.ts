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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ArtistsService } from './artists.service';
import { FileUploadService } from '../upload/file-upload.service';
import { ReleasesService } from '../releases/releases.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { CreateArtistWithFileDto } from './dto/create-artist-with-file.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { UpdateBioDto } from './dto/update-bio.dto';

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
  @ApiResponse({ status: 200, description: 'Artist releases found' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  getArtistReleases(@Param('id', ParseUUIDPipe) id: string) {
    return this.releasesService.findByArtist(id);
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
