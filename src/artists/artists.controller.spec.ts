/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';
import { FileUploadService } from '../upload/file-upload.service';
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
    imageUrl: 'http://example.com/image.jpg',
    coverUrl: 'http://example.com/cover.jpg',
    followersCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
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

  const mockFile: Express.Multer.File = {
    fieldname: 'image',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('fake-image-data'),
    destination: '',
    filename: '',
    path: '',
    stream: {} as any,
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
      ],
    }).compile();

    controller = module.get<ArtistsController>(ArtistsController);
    artistsService = module.get<ArtistsService>(ArtistsService);
    fileUploadService = module.get<FileUploadService>(FileUploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an artist without image', async () => {
      const createArtistDto: CreateArtistDto = {
        name: 'Test Artist',
      };

      mockArtistsService.create.mockResolvedValue(mockArtist);

      const result = await controller.create(createArtistDto);

      expect(artistsService.create).toHaveBeenCalledWith(createArtistDto);
      expect(result).toEqual(mockArtist);
      expect(fileUploadService.uploadFile).not.toHaveBeenCalled();
    });

    it('should create an artist with image', async () => {
      const createArtistDto: CreateArtistDto = {
        name: 'Test Artist',
      };

      const artistWithImage = {
        ...mockArtist,
        imageUrl: 'http://example.com/uploaded-image.jpg',
      };

      mockArtistsService.create.mockResolvedValue(mockArtist);
      mockFileUploadService.uploadFile.mockResolvedValue(
        'http://example.com/uploaded-image.jpg',
      );
      mockArtistsService.updateImage.mockResolvedValue(artistWithImage);

      const result = await controller.create(createArtistDto, mockFile);

      expect(artistsService.create).toHaveBeenCalledWith(createArtistDto);
      expect(fileUploadService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        'artists',
      );
      expect(artistsService.updateImage).toHaveBeenCalledWith(
        mockArtist.id,
        'http://example.com/uploaded-image.jpg',
      );
      expect(result).toEqual(artistWithImage);
    });
  });

  describe('findOne', () => {
    it('should return an artist by id', async () => {
      mockArtistsService.findOne.mockResolvedValue(mockArtist);

      const result = await controller.findOne(mockArtist.id);

      expect(artistsService.findOne).toHaveBeenCalledWith(mockArtist.id);
      expect(result).toEqual(mockArtist);
    });
  });

  describe('update', () => {
    it('should update an artist', async () => {
      const updateArtistDto: UpdateArtistDto = {
        name: 'Updated Artist Name',
      };

      const updatedArtist = { ...mockArtist, name: 'Updated Artist Name' };

      mockArtistsService.update.mockResolvedValue(updatedArtist);

      const result = await controller.update(mockArtist.id, updateArtistDto);

      expect(artistsService.update).toHaveBeenCalledWith(
        mockArtist.id,
        updateArtistDto,
      );
      expect(result).toEqual(updatedArtist);
    });
  });

  describe('updateImage', () => {
    it('should update artist image', async () => {
      const newImageUrl = 'http://example.com/new-image.jpg';
      const updatedArtist = { ...mockArtist, imageUrl: newImageUrl };

      mockFileUploadService.uploadFile.mockResolvedValue(newImageUrl);
      mockArtistsService.updateImage.mockResolvedValue(updatedArtist);

      const result = await controller.updateImage(mockArtist.id, mockFile);

      expect(fileUploadService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        'artists',
      );
      expect(artistsService.updateImage).toHaveBeenCalledWith(
        mockArtist.id,
        newImageUrl,
      );
      expect(result).toEqual(updatedArtist);
    });
  });

  describe('updateCover', () => {
    it('should update artist cover', async () => {
      const newCoverUrl = 'http://example.com/new-cover.jpg';
      const updatedArtist = { ...mockArtist, coverUrl: newCoverUrl };

      mockFileUploadService.uploadFile.mockResolvedValue(newCoverUrl);
      mockArtistsService.updateCover.mockResolvedValue(updatedArtist);

      const result = await controller.updateCover(mockArtist.id, mockFile);

      expect(fileUploadService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        'artists',
      );
      expect(artistsService.updateCover).toHaveBeenCalledWith(
        mockArtist.id,
        newCoverUrl,
      );
      expect(result).toEqual(updatedArtist);
    });
  });

  describe('remove', () => {
    it('should remove an artist', async () => {
      mockArtistsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockArtist.id);

      expect(artistsService.remove).toHaveBeenCalledWith(mockArtist.id);
      expect(result).toBeUndefined();
    });
  });
});
