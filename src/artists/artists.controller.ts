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
import { ArtistsService } from './artists.service';
import { FileUploadService } from '../upload/file-upload.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

@Controller('artists')
export class ArtistsController {
  constructor(
    private readonly artistsService: ArtistsService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
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
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.artistsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArtistDto: UpdateArtistDto,
  ) {
    return this.artistsService.update(id, updateArtistDto);
  }

  @Patch(':id/image')
  @UseInterceptors(FileInterceptor('image'))
  async updateImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = await this.fileUploadService.uploadFile(file, 'artists');
    return this.artistsService.updateImage(id, imageUrl);
  }

  @Patch(':id/cover')
  @UseInterceptors(FileInterceptor('cover'))
  async updateCover(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const coverUrl = await this.fileUploadService.uploadFile(file, 'artists');
    return this.artistsService.updateCover(id, coverUrl);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.artistsService.remove(id);
  }
}
