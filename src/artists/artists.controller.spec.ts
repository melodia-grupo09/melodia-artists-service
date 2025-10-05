/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';
import { FileUploadService } from '../upload/file-upload.service';
import { ReleasesService } from '../releases/releases.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { Artist } from './entities/artist.entity';
import { ReleaseType } from '../releases/entities/release.entity';

describe('ArtistsController', () => {
  let controller: ArtistsController;
  let artistsService: ArtistsService;
  let fileUploadService: FileUploadService;

  const mockArtist: Artist = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Artist',
    imageUrl: 'https://example.com/image.jpg',
    coverUrl: 'https://example.com/cover.jpg',
    followersCount: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    releases: [],
  };

  const mockArtistsService = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateImage: jest.fn(),
    updateCover: jest.fn(),
    remove: jest.fn(),
  };

  const mockFileUploadService = {
    uploadFile: jest.fn(),
  };

  const mockReleasesService = {
    findByArtist: jest.fn(),
    findByArtistWithLatestFlag: jest.fn(),
    findByArtistAndType: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findOneByArtist: jest.fn(),
    updateByArtist: jest.fn(),
    addSongsByArtist: jest.fn(),
    removeSongsByArtist: jest.fn(),
    removeByArtist: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistsController],
      providers: [
        {
          provide: ArtistsService,
          useValue: mockArtistsService,
        },
        {
          provide: FileUploadService,
          useValue: mockFileUploadService,
        },
        {
          provide: ReleasesService,
          useValue: mockReleasesService,
        },
      ],
    }).compile();

    controller = module.get<ArtistsController>(ArtistsController);
    artistsService = module.get<ArtistsService>(ArtistsService);
    fileUploadService = module.get<FileUploadService>(FileUploadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createArtistDto: CreateArtistDto = {
      name: 'Test Artist',
    };

    it('should create an artist without image', async () => {
      mockArtistsService.create.mockResolvedValue(mockArtist);

      const result = await controller.create(createArtistDto, undefined);

      expect(result).toEqual(mockArtist);
      expect(artistsService.create).toHaveBeenCalledWith(createArtistDto);
      expect(fileUploadService.uploadFile).not.toHaveBeenCalled();
    });

    it('should create an artist with image', async () => {
      const mockFile = {
        buffer: Buffer.from('mock file'),
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
      } as Express.Multer.File;

      const uploadedImageUrl = 'https://example.com/uploaded-image.jpg';
      mockFileUploadService.uploadFile.mockResolvedValue(uploadedImageUrl);
      mockArtistsService.create.mockResolvedValue(mockArtist);
      mockArtistsService.updateImage.mockResolvedValue(mockArtist);

      const result = await controller.create(createArtistDto, mockFile);

      expect(result).toEqual(mockArtist);
      expect(artistsService.create).toHaveBeenCalledWith(createArtistDto);
      expect(fileUploadService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        'artists',
      );
      expect(artistsService.updateImage).toHaveBeenCalledWith(
        mockArtist.id,
        uploadedImageUrl,
      );
    });
  });

  describe('findOne', () => {
    it('should return an artist', async () => {
      mockArtistsService.findOne.mockResolvedValue(mockArtist);

      const result = await controller.findOne(mockArtist.id);

      expect(result).toEqual(mockArtist);
      expect(artistsService.findOne).toHaveBeenCalledWith(mockArtist.id);
    });
  });

  describe('update', () => {
    const updateArtistDto: UpdateArtistDto = {
      name: 'Updated Artist',
    };

    it('should update an artist', async () => {
      mockArtistsService.update.mockResolvedValue(mockArtist);

      const result = await controller.update(mockArtist.id, updateArtistDto);

      expect(result).toEqual(mockArtist);
      expect(artistsService.update).toHaveBeenCalledWith(
        mockArtist.id,
        updateArtistDto,
      );
    });
  });

  describe('updateImage', () => {
    it('should update artist image', async () => {
      const mockFile = {
        buffer: Buffer.from('mock file'),
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
      } as Express.Multer.File;

      const uploadedImageUrl = 'https://example.com/uploaded-image.jpg';
      mockFileUploadService.uploadFile.mockResolvedValue(uploadedImageUrl);
      mockArtistsService.updateImage.mockResolvedValue(mockArtist);

      const result = await controller.updateImage(mockArtist.id, mockFile);

      expect(result).toEqual(mockArtist);
      expect(fileUploadService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        'artists',
      );
      expect(artistsService.updateImage).toHaveBeenCalledWith(
        mockArtist.id,
        uploadedImageUrl,
      );
    });
  });

  describe('updateCover', () => {
    it('should update artist cover', async () => {
      const mockFile = {
        buffer: Buffer.from('mock file'),
        mimetype: 'image/jpeg',
        originalname: 'cover.jpg',
      } as Express.Multer.File;

      const uploadedCoverUrl = 'https://example.com/uploaded-cover.jpg';
      mockFileUploadService.uploadFile.mockResolvedValue(uploadedCoverUrl);
      mockArtistsService.updateCover.mockResolvedValue(mockArtist);

      const result = await controller.updateCover(mockArtist.id, mockFile);

      expect(result).toEqual(mockArtist);
      expect(fileUploadService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        'artists',
      );
      expect(artistsService.updateCover).toHaveBeenCalledWith(
        mockArtist.id,
        uploadedCoverUrl,
      );
    });
  });

  describe('remove', () => {
    it('should remove an artist', async () => {
      mockArtistsService.remove.mockResolvedValue(mockArtist);

      const result = await controller.remove(mockArtist.id);

      expect(result).toEqual(mockArtist);
      expect(artistsService.remove).toHaveBeenCalledWith(mockArtist.id);
    });
  });

  describe('getArtistReleases', () => {
    it('should return releases for an artist', async () => {
      const mockReleases = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          title: 'Test Album',
          type: 'album',
          releaseDate: new Date(),
          imageUrl: 'https://example.com/album.jpg',
          songIds: ['song1', 'song2'],
          artist: mockArtist,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockReleasesService.findByArtist.mockResolvedValue(mockReleases);

      const result = await controller.getArtistReleases(mockArtist.id);

      expect(result).toEqual(mockReleases);
      expect(mockReleasesService.findByArtist).toHaveBeenCalledWith(
        mockArtist.id,
      );
    });

    it('should return releases with latest flag', async () => {
      const mockReleasesWithFlag = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          title: 'Test Album',
          type: 'album',
          releaseDate: new Date(),
          isLatest: true,
        },
      ];

      mockReleasesService.findByArtistWithLatestFlag.mockResolvedValue(
        mockReleasesWithFlag,
      );

      const result = await controller.getArtistReleases(
        mockArtist.id,
        undefined,
        true,
      );

      expect(result).toEqual(mockReleasesWithFlag);
      expect(
        mockReleasesService.findByArtistWithLatestFlag,
      ).toHaveBeenCalledWith(mockArtist.id);
    });

    it('should return releases filtered by type', async () => {
      const mockAlbums = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          title: 'Test Album',
          type: 'ALBUM',
          releaseDate: new Date(),
        },
      ];

      mockReleasesService.findByArtistAndType.mockResolvedValue(mockAlbums);

      const result = await controller.getArtistReleases(
        mockArtist.id,
        ReleaseType.ALBUM,
      );

      expect(result).toEqual(mockAlbums);
      expect(mockReleasesService.findByArtistAndType).toHaveBeenCalledWith(
        mockArtist.id,
        ReleaseType.ALBUM,
      );
    });
  });

  describe('createRelease', () => {
    it('should create a release for an artist', async () => {
      const createReleaseDto = {
        title: 'New Album',
        type: ReleaseType.ALBUM,
        releaseDate: '2023-12-01',
        songIds: ['song1', 'song2'],
      };

      const mockCreatedRelease = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        ...createReleaseDto,
        artistId: mockArtist.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockArtistsService.findOne.mockResolvedValue(mockArtist);
      mockReleasesService.create.mockResolvedValue(mockCreatedRelease);

      const result = await controller.createRelease(
        mockArtist.id,
        createReleaseDto as any,
      );

      expect(result).toEqual(mockCreatedRelease);
      expect(mockArtistsService.findOne).toHaveBeenCalledWith(mockArtist.id);
      expect(mockReleasesService.create).toHaveBeenCalledWith({
        ...createReleaseDto,
        artistId: mockArtist.id,
      });
    });

    it('should create a release with cover file', async () => {
      const createReleaseDto = {
        title: 'New Album',
        type: ReleaseType.ALBUM,
        releaseDate: '2023-12-01',
      };

      const mockFile = {
        originalname: 'cover.jpg',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const mockCreatedRelease = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        ...createReleaseDto,
        artistId: mockArtist.id,
      };

      const mockUpdatedRelease = {
        ...mockCreatedRelease,
        coverUrl: 'https://example.com/cover.jpg',
      };

      mockArtistsService.findOne.mockResolvedValue(mockArtist);
      mockReleasesService.create.mockResolvedValue(mockCreatedRelease);
      mockFileUploadService.uploadFile.mockResolvedValue(
        'https://example.com/cover.jpg',
      );
      mockReleasesService.updateByArtist.mockResolvedValue(mockUpdatedRelease);

      const result = await controller.createRelease(
        mockArtist.id,
        createReleaseDto as any,
        mockFile,
      );

      expect(result).toEqual(mockUpdatedRelease);
      expect(mockFileUploadService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        'releases',
      );
      expect(mockReleasesService.updateByArtist).toHaveBeenCalledWith(
        mockArtist.id,
        mockCreatedRelease.id,
        { coverUrl: 'https://example.com/cover.jpg' },
      );
    });
  });

  describe('getArtistRelease', () => {
    it('should return a specific artist release', async () => {
      const releaseId = '123e4567-e89b-12d3-a456-426614174002';
      const mockRelease = {
        id: releaseId,
        title: 'Test Album',
        artistId: mockArtist.id,
        artist: mockArtist,
      };

      mockReleasesService.findOneByArtist.mockResolvedValue(mockRelease);

      const result = await controller.getArtistRelease(
        mockArtist.id,
        releaseId,
      );

      expect(result).toEqual(mockRelease);
      expect(mockReleasesService.findOneByArtist).toHaveBeenCalledWith(
        mockArtist.id,
        releaseId,
      );
    });
  });

  describe('updateRelease', () => {
    it('should update a release', async () => {
      const releaseId = '123e4567-e89b-12d3-a456-426614174002';
      const updateReleaseDto = {
        title: 'Updated Album Title',
      };

      const mockUpdatedRelease = {
        id: releaseId,
        title: 'Updated Album Title',
        artistId: mockArtist.id,
      };

      mockReleasesService.updateByArtist.mockResolvedValue(mockUpdatedRelease);

      const result = await controller.updateRelease(
        mockArtist.id,
        releaseId,
        updateReleaseDto,
      );

      expect(result).toEqual(mockUpdatedRelease);
      expect(mockReleasesService.updateByArtist).toHaveBeenCalledWith(
        mockArtist.id,
        releaseId,
        updateReleaseDto,
      );
    });
  });

  describe('updateReleaseCover', () => {
    it('should update release cover', async () => {
      const releaseId = '123e4567-e89b-12d3-a456-426614174002';
      const mockFile = {
        originalname: 'new-cover.jpg',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const mockUpdatedRelease = {
        id: releaseId,
        coverUrl: 'https://example.com/new-cover.jpg',
        artistId: mockArtist.id,
      };

      mockFileUploadService.uploadFile.mockResolvedValue(
        'https://example.com/new-cover.jpg',
      );
      mockReleasesService.updateByArtist.mockResolvedValue(mockUpdatedRelease);

      const result = await controller.updateReleaseCover(
        mockArtist.id,
        releaseId,
        mockFile,
      );

      expect(result).toEqual(mockUpdatedRelease);
      expect(mockFileUploadService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        'releases',
      );
      expect(mockReleasesService.updateByArtist).toHaveBeenCalledWith(
        mockArtist.id,
        releaseId,
        { coverUrl: 'https://example.com/new-cover.jpg' },
      );
    });
  });

  describe('addSongsToRelease', () => {
    it('should add songs to a release', async () => {
      const releaseId = '123e4567-e89b-12d3-a456-426614174002';
      const songIds = ['song3', 'song4'];

      const mockUpdatedRelease = {
        id: releaseId,
        songIds: ['song1', 'song2', 'song3', 'song4'],
        artistId: mockArtist.id,
      };

      mockReleasesService.addSongsByArtist.mockResolvedValue(
        mockUpdatedRelease,
      );

      const result = await controller.addSongsToRelease(
        mockArtist.id,
        releaseId,
        { songIds },
      );

      expect(result).toEqual(mockUpdatedRelease);
      expect(mockReleasesService.addSongsByArtist).toHaveBeenCalledWith(
        mockArtist.id,
        releaseId,
        songIds,
      );
    });
  });

  describe('removeSongsFromRelease', () => {
    it('should remove songs from a release', async () => {
      const releaseId = '123e4567-e89b-12d3-a456-426614174002';
      const songIds = ['song2'];

      const mockUpdatedRelease = {
        id: releaseId,
        songIds: ['song1'],
        artistId: mockArtist.id,
      };

      mockReleasesService.removeSongsByArtist.mockResolvedValue(
        mockUpdatedRelease,
      );

      const result = await controller.removeSongsFromRelease(
        mockArtist.id,
        releaseId,
        { songIds },
      );

      expect(result).toEqual(mockUpdatedRelease);
      expect(mockReleasesService.removeSongsByArtist).toHaveBeenCalledWith(
        mockArtist.id,
        releaseId,
        songIds,
      );
    });
  });

  describe('removeRelease', () => {
    it('should delete a release', async () => {
      const releaseId = '123e4567-e89b-12d3-a456-426614174002';

      mockReleasesService.removeByArtist.mockResolvedValue(undefined);

      const result = await controller.removeRelease(mockArtist.id, releaseId);

      expect(result).toBeUndefined();
      expect(mockReleasesService.removeByArtist).toHaveBeenCalledWith(
        mockArtist.id,
        releaseId,
      );
    });
  });
});
