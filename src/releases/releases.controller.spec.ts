import { Test, TestingModule } from '@nestjs/testing';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './releases.service';
import { FileUploadService } from '../upload/file-upload.service';
import { ReleaseType } from './entities/release.entity';

describe('ReleasesController', () => {
  let controller: ReleasesController;

  const mockRelease = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Album',
    type: ReleaseType.ALBUM,
    releaseDate: new Date('2023-05-12'),
    coverUrl: 'https://example.com/cover.jpg',
    artistId: '456e7890-e89b-12d3-a456-426614174000',
    songIds: ['song1', 'song2'],
    createdAt: new Date(),
    updatedAt: new Date(),
    artist: {
      id: '456e7890-e89b-12d3-a456-426614174000',
      name: 'Test Artist',
    },
  };

  const mockReleasesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByArtist: jest.fn(),
    findByArtistAndType: jest.fn(),
    update: jest.fn(),
    addSongs: jest.fn(),
    removeSongs: jest.fn(),
    remove: jest.fn(),
  };

  const mockFileUploadService = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReleasesController],
      providers: [
        {
          provide: ReleasesService,
          useValue: mockReleasesService,
        },
        {
          provide: FileUploadService,
          useValue: mockFileUploadService,
        },
      ],
    }).compile();

    controller = module.get<ReleasesController>(ReleasesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createReleaseDto = {
      title: 'Test Album',
      type: ReleaseType.ALBUM,
      releaseDate: '2023-05-12',
      artistId: '456e7890-e89b-12d3-a456-426614174000',
      songIds: ['song1', 'song2'],
    };

    it('should create a release without file', async () => {
      mockReleasesService.create.mockResolvedValue(mockRelease);

      const result = await controller.create(createReleaseDto);

      expect(mockReleasesService.create).toHaveBeenCalledWith(createReleaseDto);
      expect(result).toEqual(mockRelease);
    });

    it('should create a release with cover file', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'cover.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const releaseWithCover = {
        ...mockRelease,
        coverUrl: 'https://cloudinary.com/uploaded-cover.jpg',
      };

      mockReleasesService.create.mockResolvedValue(mockRelease);
      mockFileUploadService.uploadFile.mockResolvedValue(
        'https://cloudinary.com/uploaded-cover.jpg',
      );
      mockReleasesService.update.mockResolvedValue(releaseWithCover);

      const result = await controller.create(createReleaseDto, mockFile);

      expect(mockReleasesService.create).toHaveBeenCalledWith(createReleaseDto);
      expect(mockFileUploadService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        'releases',
      );
      expect(mockReleasesService.update).toHaveBeenCalledWith(mockRelease.id, {
        coverUrl: 'https://cloudinary.com/uploaded-cover.jpg',
      });
      expect(result).toEqual(releaseWithCover);
    });
  });

  describe('findAll', () => {
    it('should return all releases', async () => {
      const releases = [mockRelease];
      mockReleasesService.findAll.mockResolvedValue(releases);

      const result = await controller.findAll();

      expect(mockReleasesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(releases);
    });
  });

  describe('findByArtist', () => {
    const artistId = '456e7890-e89b-12d3-a456-426614174000';

    it('should return releases by artist', async () => {
      const releases = [mockRelease];
      mockReleasesService.findByArtist.mockResolvedValue(releases);

      const result = await controller.findByArtist(artistId);

      expect(mockReleasesService.findByArtist).toHaveBeenCalledWith(artistId);
      expect(result).toEqual(releases);
    });

    it('should return releases by artist and type', async () => {
      const releases = [mockRelease];
      mockReleasesService.findByArtistAndType.mockResolvedValue(releases);

      const result = await controller.findByArtist(artistId, ReleaseType.ALBUM);

      expect(mockReleasesService.findByArtistAndType).toHaveBeenCalledWith(
        artistId,
        ReleaseType.ALBUM,
      );
      expect(result).toEqual(releases);
    });
  });

  describe('findOne', () => {
    it('should return a release by id', async () => {
      mockReleasesService.findOne.mockResolvedValue(mockRelease);

      const result = await controller.findOne(mockRelease.id);

      expect(mockReleasesService.findOne).toHaveBeenCalledWith(mockRelease.id);
      expect(result).toEqual(mockRelease);
    });
  });

  describe('update', () => {
    it('should update a release', async () => {
      const updateDto = { title: 'Updated Album' };
      const updatedRelease = { ...mockRelease, ...updateDto };

      mockReleasesService.update.mockResolvedValue(updatedRelease);

      const result = await controller.update(mockRelease.id, updateDto);

      expect(mockReleasesService.update).toHaveBeenCalledWith(
        mockRelease.id,
        updateDto,
      );
      expect(result).toEqual(updatedRelease);
    });
  });

  describe('updateCover', () => {
    it('should update release cover', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'cover.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const updatedRelease = {
        ...mockRelease,
        coverUrl: 'https://cloudinary.com/new-cover.jpg',
      };

      mockFileUploadService.uploadFile.mockResolvedValue(
        'https://cloudinary.com/new-cover.jpg',
      );
      mockReleasesService.update.mockResolvedValue(updatedRelease);

      const result = await controller.updateCover(mockRelease.id, mockFile);

      expect(mockFileUploadService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        'releases',
      );
      expect(mockReleasesService.update).toHaveBeenCalledWith(mockRelease.id, {
        coverUrl: 'https://cloudinary.com/new-cover.jpg',
      });
      expect(result).toEqual(updatedRelease);
    });
  });

  describe('addSongs', () => {
    it('should add songs to release', async () => {
      const songIds = ['song3', 'song4'];
      const updatedRelease = {
        ...mockRelease,
        songIds: [...mockRelease.songIds, ...songIds],
      };

      mockReleasesService.addSongs.mockResolvedValue(updatedRelease);

      const result = await controller.addSongs(mockRelease.id, { songIds });

      expect(mockReleasesService.addSongs).toHaveBeenCalledWith(
        mockRelease.id,
        songIds,
      );
      expect(result).toEqual(updatedRelease);
    });
  });

  describe('removeSongs', () => {
    it('should remove songs from release', async () => {
      const songIds = ['song1'];
      const updatedRelease = {
        ...mockRelease,
        songIds: ['song2'],
      };

      mockReleasesService.removeSongs.mockResolvedValue(updatedRelease);

      const result = await controller.removeSongs(mockRelease.id, { songIds });

      expect(mockReleasesService.removeSongs).toHaveBeenCalledWith(
        mockRelease.id,
        songIds,
      );
      expect(result).toEqual(updatedRelease);
    });
  });

  describe('remove', () => {
    it('should remove a release', async () => {
      mockReleasesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockRelease.id);

      expect(mockReleasesService.remove).toHaveBeenCalledWith(mockRelease.id);
      expect(result).toBeUndefined();
    });
  });
});
