import { Test, TestingModule } from '@nestjs/testing';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './releases.service';
import { Release, ReleaseType } from './entities/release.entity';
import { NotFoundException } from '@nestjs/common';

describe('ReleasesController', () => {
  let controller: ReleasesController;

  const mockRelease: Release = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Album',
    type: ReleaseType.ALBUM,
    releaseDate: new Date('2023-01-01'),
    coverUrl: 'http://example.com/cover.jpg',
    artist: {
      id: 'artist123',
      name: 'Test Artist',
      imageUrl: 'http://example.com/artist.jpg',
      coverUrl: 'http://example.com/cover.jpg',
      followersCount: 1000,
      bio: 'Test bio',
      socialLinks: {},
      releases: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    artistId: 'artist123',
    songIds: ['song1', 'song2'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReleasesService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReleasesController],
      providers: [
        {
          provide: ReleasesService,
          useValue: mockReleasesService,
        },
      ],
    }).compile();

    controller = module.get<ReleasesController>(ReleasesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a release with artist information', async () => {
      mockReleasesService.findOne.mockResolvedValue(mockRelease);

      const result = await controller.findOne(
        '123e4567-e89b-12d3-a456-426614174000',
      );

      expect(result).toEqual(mockRelease);
      expect(result.artist).toBeDefined();
      expect(result.artist.name).toBe('Test Artist');
      expect(mockReleasesService.findOne).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
      );
    });

    it('should throw NotFoundException when release does not exist', async () => {
      mockReleasesService.findOne.mockRejectedValue(
        new NotFoundException('Release with ID non-existent not found'),
      );

      await expect(controller.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockReleasesService.findOne).toHaveBeenCalledWith('non-existent');
    });
  });
});
