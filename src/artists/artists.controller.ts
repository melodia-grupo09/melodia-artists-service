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
    description: 'Artist data with optional image file',
    type: CreateArtistWithFileDto,
    examples: {
      'Create artist with all data': {
        value: {
          id: '8c66f123-bca6-4e80-a09f-c60b4e9534e4',
          name: 'Bad Bunny',
          bio: 'Puerto Rican rapper, singer, and songwriter. He is known for his deep, slurred vocal style and his eclectic fashion sense.',
          socialLinks:
            '{"instagram":"https://instagram.com/badbunnypr","twitter":"https://twitter.com/sanbenito","spotify":"https://open.spotify.com/artist/4q3ewBCX7sLwd24euuV69X","youtube":"https://youtube.com/c/BadBunnyOfficial","website":"https://badbunny.com"}',
          image: '[Binary file data - Select image file in Postman]',
        },
      },
      'Create artist with minimal data': {
        value: {
          id: '8c66f123-bca6-4e80-a09f-c60b4e9534e4',
          name: 'New Artist',
        },
      },
      'Create artist with social links only': {
        value: {
          id: '8c66f123-bca6-4e80-a09f-c60b4e9534e4',
          name: 'Rosalía',
          socialLinks:
            '{"instagram":"https://instagram.com/rosalia.vt","spotify":"https://open.spotify.com/artist/7ltDVBr6mKbRvohxheJ9h1"}',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Artist created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request or artist name already exists',
  })
  async create(
    @Body() body: Record<string, unknown>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      // Extract only the valid CreateArtistDto fields, ignore 'image' field
      const createArtistDto: CreateArtistDto = {
        id: body.id as string,
        name: body.name as string,
        bio: body.bio as string | undefined,
        socialLinks: body.socialLinks
          ? typeof body.socialLinks === 'string'
            ? (JSON.parse(body.socialLinks) as CreateArtistDto['socialLinks'])
            : (body.socialLinks as CreateArtistDto['socialLinks'])
          : undefined,
      };

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
  @ApiParam({ name: 'id', description: 'Artist ID' })
  @ApiResponse({ status: 200, description: 'Artist found' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  findOne(@Param('id') id: string) {
    return this.artistsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update artist information' })
  @ApiParam({ name: 'id', description: 'Artist ID' })
  @ApiBody({
    type: UpdateArtistDto,
    description: 'Artist data to update (all fields are optional)',
    examples: {
      'Update all fields': {
        value: {
          name: 'J Balvin',
          bio: 'Colombian reggaeton singer, songwriter, and record producer.',
          socialLinks: {
            instagram: 'https://instagram.com/jbalvin',
            twitter: 'https://twitter.com/jbalvin',
            spotify: 'https://open.spotify.com/artist/1vyhD5VmyZ7KMfW5gqLgo5',
            youtube: 'https://youtube.com/c/JBalvinOfficial',
            website: 'https://jbalvin.com',
          },
        },
      },
      'Update only name': {
        value: {
          name: 'New Artist Name',
        },
      },
      'Update only bio': {
        value: {
          bio: 'New artist biography with updated information about their career and achievements.',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Artist updated successfully' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  update(@Param('id') id: string, @Body() updateArtistDto: UpdateArtistDto) {
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
  @ApiParam({ name: 'id', description: 'Artist ID' })
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
    @Param('id') id: string,
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
  @ApiParam({ name: 'id', description: 'Artist ID' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ReleaseType,
    description: 'Filter releases by type',
  })
  @ApiQuery({
    name: 'withLatestFlag',
    required: false,
    type: Boolean,
    description: 'Include latest flag for each release',
  })
  @ApiResponse({ status: 200, description: 'Artist releases found' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  getArtistReleases(
    @Param('id') id: string,
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
  @ApiParam({ name: 'id', description: 'Artist ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Release data with optional cover image',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'Vida Rockstar',
          description: 'The title of the release',
        },
        type: {
          type: 'string',
          enum: ['SINGLE', 'EP', 'ALBUM', 'COMPILATION'],
          example: 'ALBUM',
          description: 'Type of release',
        },
        releaseDate: {
          type: 'string',
          format: 'date',
          example: '2023-05-12',
          description: 'Release date in ISO format (YYYY-MM-DD)',
        },
        songIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['song-id-1', 'song-id-2', 'song-id-3'],
          description: 'Array of song IDs from the songs microservice',
        },
        cover: {
          type: 'string',
          format: 'binary',
          description: 'Cover image file (optional)',
        },
      },
      required: ['title', 'type', 'releaseDate'],
    },
    examples: {
      albumWithCover: {
        summary: 'Album with cover image',
        description: 'Creating a full album with cover image and songs',
        value: {
          title: 'Vida Rockstar',
          type: 'ALBUM',
          releaseDate: '2023-05-12',
          songIds: ['song-id-1', 'song-id-2', 'song-id-3'],
          cover: '(binary file)',
        },
      },
      singleRelease: {
        summary: 'Single release',
        description: 'Creating a single without cover image',
        value: {
          title: 'Mi Nuevo Single',
          type: 'SINGLE',
          releaseDate: '2024-01-15',
          songIds: ['single-song-id'],
        },
      },
      epRelease: {
        summary: 'EP release',
        description: 'Creating an EP with multiple songs',
        value: {
          title: 'Primeros Pasos EP',
          type: 'EP',
          releaseDate: '2024-02-20',
          songIds: ['ep-song-1', 'ep-song-2', 'ep-song-3', 'ep-song-4'],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Release created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - A release with the same title already exists for this artist',
  })
  async createRelease(
    @Param('id') artistId: string,
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
  @ApiParam({ name: 'artistId', description: 'Artist ID' })
  @ApiParam({ name: 'releaseId', description: 'Release UUID' })
  @ApiResponse({ status: 200, description: 'Release found' })
  @ApiResponse({ status: 404, description: 'Release or artist not found' })
  getArtistRelease(
    @Param('artistId') artistId: string,
    @Param('releaseId', ParseUUIDPipe) releaseId: string,
  ) {
    return this.releasesService.findOneByArtist(artistId, releaseId);
  }

  @Patch(':artistId/releases/:releaseId')
  @ApiOperation({ summary: 'Update release information' })
  @ApiParam({ name: 'artistId', description: 'Artist ID' })
  @ApiParam({ name: 'releaseId', description: 'Release UUID' })
  @ApiBody({
    description: 'Release data to update (all fields optional)',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'Vida Rockstar (Deluxe Edition)',
          description: 'Updated title of the release',
        },
        type: {
          type: 'string',
          enum: ['SINGLE', 'EP', 'ALBUM', 'COMPILATION'],
          example: 'ALBUM',
          description: 'Updated type of release',
        },
        releaseDate: {
          type: 'string',
          format: 'date',
          example: '2023-06-15',
          description: 'Updated release date in ISO format (YYYY-MM-DD)',
        },
        songIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['song-id-1', 'song-id-2', 'song-id-3', 'bonus-track-1'],
          description: 'Updated array of song IDs',
        },
      },
    },
    examples: {
      updateTitle: {
        summary: 'Update title only',
        description: 'Change only the release title',
        value: {
          title: 'Vida Rockstar (Deluxe Edition)',
        },
      },
      updateMultipleFields: {
        summary: 'Update multiple fields',
        description: 'Update title, release date and add songs',
        value: {
          title: 'Vida Rockstar (Deluxe Edition)',
          releaseDate: '2023-06-15',
          songIds: [
            'song-id-1',
            'song-id-2',
            'song-id-3',
            'bonus-track-1',
            'bonus-track-2',
          ],
        },
      },
      changeType: {
        summary: 'Change release type',
        description: 'Convert single to EP',
        value: {
          type: 'EP',
          songIds: ['original-song', 'acoustic-version', 'remix'],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Release updated successfully' })
  @ApiResponse({ status: 404, description: 'Release or artist not found' })
  updateRelease(
    @Param('artistId') artistId: string,
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
  @ApiParam({ name: 'artistId', description: 'Artist ID' })
  @ApiParam({ name: 'releaseId', description: 'Release UUID' })
  @ApiBody({
    description: 'Cover image file to replace the current one',
    schema: {
      type: 'object',
      properties: {
        cover: {
          type: 'string',
          format: 'binary',
          description: 'New cover image file (required)',
        },
      },
      required: ['cover'],
    },
    examples: {
      coverUpdate: {
        summary: 'Update cover image',
        description: 'Replace the current cover with a new image',
        value: {
          cover: '(binary file - JPEG, PNG, or WebP format)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Cover updated successfully' })
  @ApiResponse({ status: 404, description: 'Release or artist not found' })
  async updateReleaseCover(
    @Param('artistId') artistId: string,
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
  @ApiParam({ name: 'artistId', description: 'Artist ID' })
  @ApiParam({ name: 'releaseId', description: 'Release UUID' })
  @ApiBody({
    description: 'Song IDs to add to the release',
    schema: {
      type: 'object',
      properties: {
        songIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['new-song-1', 'new-song-2'],
          description: 'Array of song IDs to add to the release',
        },
      },
      required: ['songIds'],
    },
    examples: {
      addSingleSong: {
        summary: 'Add single song',
        description: 'Add one song to the release',
        value: {
          songIds: ['bonus-track-id'],
        },
      },
      addMultipleSongs: {
        summary: 'Add multiple songs',
        description: 'Add several songs to the release',
        value: {
          songIds: ['bonus-track-1', 'bonus-track-2', 'deluxe-song'],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Songs added successfully' })
  addSongsToRelease(
    @Param('artistId') artistId: string,
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
  @ApiParam({ name: 'artistId', description: 'Artist ID' })
  @ApiParam({ name: 'releaseId', description: 'Release UUID' })
  @ApiBody({
    description: 'Song IDs to remove from the release',
    schema: {
      type: 'object',
      properties: {
        songIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['song-to-remove-1', 'song-to-remove-2'],
          description: 'Array of song IDs to remove from the release',
        },
      },
      required: ['songIds'],
    },
    examples: {
      removeSingleSong: {
        summary: 'Remove single song',
        description: 'Remove one song from the release',
        value: {
          songIds: ['unwanted-track-id'],
        },
      },
      removeMultipleSongs: {
        summary: 'Remove multiple songs',
        description: 'Remove several songs from the release',
        value: {
          songIds: ['old-demo-1', 'old-demo-2', 'duplicate-track'],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Songs removed successfully' })
  removeSongsFromRelease(
    @Param('artistId') artistId: string,
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
  @ApiParam({ name: 'artistId', description: 'Artist ID' })
  @ApiParam({ name: 'releaseId', description: 'Release UUID' })
  @ApiResponse({ status: 200, description: 'Release deleted successfully' })
  @ApiResponse({ status: 404, description: 'Release or artist not found' })
  removeRelease(
    @Param('artistId') artistId: string,
    @Param('releaseId', ParseUUIDPipe) releaseId: string,
  ) {
    return this.releasesService.removeByArtist(artistId, releaseId);
  }

  @Patch(':id/follow')
  @ApiOperation({ summary: 'Follow artist (increment followers count)' })
  @ApiParam({ name: 'id', description: 'Artist ID' })
  @ApiResponse({
    status: 200,
    description: 'Follower count incremented successfully',
  })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  followArtist(@Param('id') id: string) {
    return this.artistsService.incrementFollowers(id);
  }

  @Patch(':id/unfollow')
  @ApiOperation({ summary: 'Unfollow artist (decrement followers count)' })
  @ApiParam({ name: 'id', description: 'Artist ID' })
  @ApiResponse({
    status: 200,
    description: 'Follower count decremented successfully',
  })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  unfollowArtist(@Param('id') id: string) {
    return this.artistsService.decrementFollowers(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete artist' })
  @ApiParam({ name: 'id', description: 'Artist ID' })
  @ApiResponse({ status: 200, description: 'Artist deleted successfully' })
  @ApiResponse({ status: 404, description: 'Artist not found' })
  remove(@Param('id') id: string) {
    return this.artistsService.remove(id);
  }
}
