import { Test, TestingModule } from '@nestjs/testing';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './releases.service';
import { Release, ReleaseType, ReleaseStatus } from './entities/release.entity';
import { NotFoundException } from '@nestjs/common';

describe('ReleasesController', () => {
  let controller: ReleasesController;

  const mockRelease: Release = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Album',
    type: ReleaseType.ALBUM,
    status: ReleaseStatus.PUBLISHED,
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
    search: jest.fn(),
    getCoverUrlBySongId: jest.fn(),
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

  describe('searchReleases', () => {
    const mockSearchResults: Release[] = [
      {
        id: '1',
        title: 'Test Release',
        type: ReleaseType.ALBUM,
        status: ReleaseStatus.PUBLISHED,
        releaseDate: new Date('2023-01-01'),
        coverUrl: 'http://example.com/cover.jpg',
        artist: {
          id: 'artist1',
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
        artistId: 'artist1',
        songIds: ['song1', 'song2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Another Release',
        type: ReleaseType.SINGLE,
        status: ReleaseStatus.PUBLISHED,
        releaseDate: new Date('2023-02-01'),
        coverUrl: 'http://example.com/cover2.jpg',
        artist: {
          id: 'artist2',
          name: 'Another Artist',
          imageUrl: 'http://example.com/artist2.jpg',
          coverUrl: 'http://example.com/cover2.jpg',
          followersCount: 500,
          bio: 'Another bio',
          socialLinks: {},
          releases: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        artistId: 'artist2',
        songIds: ['song3'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return releases matching the search query', async () => {
      mockReleasesService.search.mockResolvedValue(mockSearchResults);

      const result = await controller.searchReleases('Test', 1, 20);

      expect(result).toEqual(mockSearchResults);
      expect(mockReleasesService.search).toHaveBeenCalledWith('Test', 20, 1);
    });

    it('should use default pagination values', async () => {
      mockReleasesService.search.mockResolvedValue(mockSearchResults);

      const result = await controller.searchReleases('Test', 1, 20);

      expect(result).toEqual(mockSearchResults);
      expect(mockReleasesService.search).toHaveBeenCalledWith('Test', 20, 1);
    });

    it('should throw BadRequestException when query is missing', async () => {
      await expect(controller.searchReleases('', 1, 20)).rejects.toThrow(
        'Query parameter is required',
      );
    });

    it('should throw BadRequestException when page is less than 1', async () => {
      await expect(controller.searchReleases('Test', 0, 20)).rejects.toThrow(
        'Page must be greater than 0',
      );
    });

    it('should throw BadRequestException when limit is less than 1', async () => {
      await expect(controller.searchReleases('Test', 1, 0)).rejects.toThrow(
        'Limit must be between 1 and 100',
      );
    });

    it('should throw BadRequestException when limit is greater than 100', async () => {
      await expect(controller.searchReleases('Test', 1, 101)).rejects.toThrow(
        'Limit must be between 1 and 100',
      );
    });
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

  describe('getCoverUrlBySongId', () => {
    it('should return cover URL for a given song ID', async () => {
      const songId = '550e8400-e29b-41d4-a716-446655440000';
      const mockCoverUrl = {
        coverUrl: 'https://res.cloudinary.com/test/cover.jpg',
      };

      mockReleasesService.getCoverUrlBySongId.mockResolvedValue(mockCoverUrl);

      const result = await controller.getCoverUrlBySongId(songId);

      expect(result).toEqual(mockCoverUrl);
      expect(mockReleasesService.getCoverUrlBySongId).toHaveBeenCalledWith(
        songId,
      );
    });

    it('should throw NotFoundException when no release contains the song', async () => {
      const songId = 'non-existent-song-id';

      mockReleasesService.getCoverUrlBySongId.mockRejectedValue(
        new NotFoundException(
          `No release found containing song with ID ${songId}`,
        ),
      );

      await expect(controller.getCoverUrlBySongId(songId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getCoverUrlBySongId(songId)).rejects.toThrow(
        `No release found containing song with ID ${songId}`,
      );
      expect(mockReleasesService.getCoverUrlBySongId).toHaveBeenCalledWith(
        songId,
      );
    });

    it('should throw NotFoundException when release has no cover URL', async () => {
      const songId = 'song-without-cover';

      mockReleasesService.getCoverUrlBySongId.mockRejectedValue(
        new NotFoundException(
          'Release found but has no cover image associated',
        ),
      );

      await expect(controller.getCoverUrlBySongId(songId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getCoverUrlBySongId(songId)).rejects.toThrow(
        'Release found but has no cover image associated',
      );
      expect(mockReleasesService.getCoverUrlBySongId).toHaveBeenCalledWith(
        songId,
      );
    });
  });
});
