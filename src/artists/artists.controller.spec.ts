/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';
import { FileUploadService } from '../upload/file-upload.service';
import { ReleasesService } from '../releases/releases.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { Artist } from './entities/artist.entity';

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
  });
});
