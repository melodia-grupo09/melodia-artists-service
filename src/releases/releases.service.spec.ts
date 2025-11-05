import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ReleasesService } from './releases.service';
import { Release, ReleaseType } from './entities/release.entity';

describe('ReleasesService', () => {
  let service: ReleasesService;

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

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReleasesService,
        {
          provide: getRepositoryToken(Release),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ReleasesService>(ReleasesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new release', async () => {
      const createReleaseDto = {
        title: 'Test Album',
        type: ReleaseType.ALBUM,
        releaseDate: '2023-05-12',
        artistId: '456e7890-e89b-12d3-a456-426614174000',
        songIds: ['song1', 'song2'],
      };

      mockRepository.create.mockReturnValue(mockRelease);
      mockRepository.save.mockResolvedValue(mockRelease);

      const result = await service.create(createReleaseDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createReleaseDto,
        releaseDate: new Date(createReleaseDto.releaseDate),
        songIds: createReleaseDto.songIds,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockRelease);
      expect(result).toEqual(mockRelease);
    });

    it('should create a release with empty songIds if not provided', async () => {
      const createReleaseDto = {
        title: 'Test Album',
        type: ReleaseType.ALBUM,
        releaseDate: '2023-05-12',
        artistId: '456e7890-e89b-12d3-a456-426614174000',
      };

      mockRepository.create.mockReturnValue(mockRelease);
      mockRepository.save.mockResolvedValue(mockRelease);

      await service.create(createReleaseDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createReleaseDto,
        releaseDate: new Date(createReleaseDto.releaseDate),
        songIds: [],
      });
    });

    it('should throw ConflictException when creating a release with duplicate title for same artist', async () => {
      const createReleaseDto = {
        title: 'Duplicate Album',
        type: ReleaseType.ALBUM,
        releaseDate: '2023-05-12',
        artistId: '456e7890-e89b-12d3-a456-426614174000',
      };

      const existingRelease = {
        id: 'existing-123',
        title: 'Duplicate Album',
        artistId: '456e7890-e89b-12d3-a456-426614174000',
      };

      // Mock findOne to return existing release (meaning duplicate found)
      mockRepository.findOne.mockResolvedValue(existingRelease);

      await expect(service.create(createReleaseDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createReleaseDto)).rejects.toThrow(
        'A release with the title "Duplicate Album" already exists for this artist',
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          title: createReleaseDto.title,
          artistId: createReleaseDto.artistId,
        },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should create a release when title exists for different artist', async () => {
      const createReleaseDto = {
        title: 'Same Title Different Artist',
        type: ReleaseType.ALBUM,
        releaseDate: '2023-05-12',
        artistId: '456e7890-e89b-12d3-a456-426614174000',
      };

      // Mock findOne to return null (no duplicate for this artist)
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockRelease);
      mockRepository.save.mockResolvedValue(mockRelease);

      const result = await service.create(createReleaseDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          title: createReleaseDto.title,
          artistId: createReleaseDto.artistId,
        },
      });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockRelease);
    });
  });

  describe('findAll', () => {
    it('should return all releases', async () => {
      const releases = [mockRelease];
      mockRepository.find.mockResolvedValue(releases);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['artist'],
        order: {
          releaseDate: 'DESC',
          title: 'ASC',
        },
      });
      expect(result).toEqual(releases);
    });
  });

  describe('findOne', () => {
    it('should return a release when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockRelease);

      const result = await service.findOne(mockRelease.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockRelease.id },
        relations: ['artist'],
      });
      expect(result).toEqual(mockRelease);
    });

    it('should throw NotFoundException when release not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByArtist', () => {
    it('should return releases by artist', async () => {
      const releases = [mockRelease];
      mockRepository.find.mockResolvedValue(releases);

      const result = await service.findByArtist(mockRelease.artistId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { artistId: mockRelease.artistId },
        relations: ['artist'],
        order: {
          releaseDate: 'DESC',
          title: 'ASC',
        },
      });
      expect(result).toEqual(releases);
    });
  });

  describe('findByArtistAndType', () => {
    it('should return releases by artist and type', async () => {
      const releases = [mockRelease];
      mockRepository.find.mockResolvedValue(releases);

      const result = await service.findByArtistAndType(
        mockRelease.artistId,
        ReleaseType.ALBUM,
      );

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { artistId: mockRelease.artistId, type: ReleaseType.ALBUM },
        relations: ['artist'],
        order: {
          releaseDate: 'DESC',
          title: 'ASC',
        },
      });
      expect(result).toEqual(releases);
    });
  });

  describe('update', () => {
    it('should update a release', async () => {
      const updateDto = { title: 'Updated Album' };
      const updatedRelease = { ...mockRelease, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockRelease);
      mockRepository.save.mockResolvedValue(updatedRelease);

      const result = await service.update(mockRelease.id, updateDto);

      expect(result).toEqual(updatedRelease);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should update release with new date', async () => {
      const updateDto = { releaseDate: '2024-01-01' };

      mockRepository.findOne.mockResolvedValue(mockRelease);
      mockRepository.save.mockResolvedValue(mockRelease);

      await service.update(mockRelease.id, updateDto);

      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when updating to duplicate title for same artist', async () => {
      const updateDto = { title: 'Existing Album Title' };
      const existingRelease = {
        id: 'different-id',
        title: 'Existing Album Title',
        artistId: mockRelease.artistId,
      };

      // First call to findOne returns the current release being updated
      // Second call to findOne returns the existing release with same title
      mockRepository.findOne
        .mockResolvedValueOnce(mockRelease)
        .mockResolvedValueOnce(existingRelease);

      await expect(service.update(mockRelease.id, updateDto)).rejects.toThrow(
        ConflictException,
      );

      // Reset mocks and test again for the specific error message
      mockRepository.findOne
        .mockResolvedValueOnce(mockRelease)
        .mockResolvedValueOnce(existingRelease);

      await expect(service.update(mockRelease.id, updateDto)).rejects.toThrow(
        'A release with the title "Existing Album Title" already exists for this artist',
      );
    });

    it('should update title when no duplicate exists', async () => {
      const updateDto = { title: 'New Unique Title' };
      const updatedRelease = { ...mockRelease, ...updateDto };

      // First call to findOne returns the current release being updated
      // Second call to findOne returns null (no duplicate found)
      mockRepository.findOne
        .mockResolvedValueOnce(mockRelease)
        .mockResolvedValueOnce(null);
      mockRepository.save.mockResolvedValue(updatedRelease);

      const result = await service.update(mockRelease.id, updateDto);

      expect(result).toEqual(updatedRelease);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should update title to same title (no change)', async () => {
      const updateDto = { title: mockRelease.title };
      const updatedRelease = { ...mockRelease, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockRelease);
      mockRepository.save.mockResolvedValue(updatedRelease);

      const result = await service.update(mockRelease.id, updateDto);

      expect(result).toEqual(updatedRelease);
      expect(mockRepository.save).toHaveBeenCalled();
      // Should not check for duplicates when title hasn't changed
    });
  });

  describe('addSongs', () => {
    it('should add songs to release', async () => {
      const newSongs = ['song3', 'song4'];
      const updatedRelease = {
        ...mockRelease,
        songIds: [...mockRelease.songIds, ...newSongs],
      };

      mockRepository.findOne.mockResolvedValue(mockRelease);
      mockRepository.save.mockResolvedValue(updatedRelease);

      const result = await service.addSongs(mockRelease.id, newSongs);

      expect(result.songIds).toEqual(['song1', 'song2', 'song3', 'song4']);
    });

    it('should not add duplicate songs', async () => {
      const duplicateSongs = ['song1', 'song3'];
      const updatedRelease = {
        ...mockRelease,
        songIds: ['song1', 'song2', 'song3'],
      };

      mockRepository.findOne.mockResolvedValue(mockRelease);
      mockRepository.save.mockResolvedValue(updatedRelease);

      const result = await service.addSongs(mockRelease.id, duplicateSongs);

      expect(result.songIds).toEqual(['song1', 'song2', 'song3']);
    });
  });

  describe('removeSongs', () => {
    it('should remove songs from release', async () => {
      const songsToRemove = ['song1'];
      const updatedRelease = {
        ...mockRelease,
        songIds: ['song2'],
      };

      mockRepository.findOne.mockResolvedValue(mockRelease);
      mockRepository.save.mockResolvedValue(updatedRelease);

      const result = await service.removeSongs(mockRelease.id, songsToRemove);

      expect(result.songIds).toEqual(['song2']);
    });
  });

  describe('remove', () => {
    it('should remove a release', async () => {
      mockRepository.findOne.mockResolvedValue(mockRelease);
      mockRepository.remove.mockResolvedValue(mockRelease);

      await service.remove(mockRelease.id);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockRelease);
    });

    it('should throw NotFoundException when release not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findLatestByArtist', () => {
    it('should return the latest release by artist', async () => {
      mockRepository.findOne.mockResolvedValue(mockRelease);

      const result = await service.findLatestByArtist(mockRelease.artistId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { artistId: mockRelease.artistId },
        relations: ['artist'],
        order: {
          releaseDate: 'DESC',
          title: 'ASC',
        },
      });
      expect(result).toEqual(mockRelease);
    });
  });

  describe('findByArtistWithLatestFlag', () => {
    it('should return releases with isLatest flag', async () => {
      const releases = [mockRelease];
      mockRepository.find.mockResolvedValue(releases);

      const result = await service.findByArtistWithLatestFlag(
        mockRelease.artistId,
      );

      expect(result).toHaveLength(1);
      expect(result[0].isLatest).toBe(true); // First release should be latest
    });

    it('should handle empty releases array', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findByArtistWithLatestFlag(
        mockRelease.artistId,
      );

      expect(result).toEqual([]);
    });
  });

  describe('findOneByArtist', () => {
    it('should return a release when found by artist and release ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockRelease);

      const result = await service.findOneByArtist(
        mockRelease.artistId,
        mockRelease.id,
      );

      expect(result).toEqual(mockRelease);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockRelease.id, artistId: mockRelease.artistId },
        relations: ['artist'],
      });
    });

    it('should throw NotFoundException when release not found for artist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneByArtist(mockRelease.artistId, mockRelease.id),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.findOneByArtist(mockRelease.artistId, mockRelease.id),
      ).rejects.toThrow(
        `Release with ID ${mockRelease.id} not found for artist ${mockRelease.artistId}`,
      );
    });
  });

  describe('updateByArtist', () => {
    it('should update a release by artist', async () => {
      const updateDto = { title: 'Updated Album Title' };
      const updatedRelease = { ...mockRelease, ...updateDto };

      mockRepository.findOne
        .mockResolvedValueOnce(mockRelease) // findOneByArtist call
        .mockResolvedValueOnce(null); // duplicate check call
      mockRepository.save.mockResolvedValue(updatedRelease);

      const result = await service.updateByArtist(
        mockRelease.artistId,
        mockRelease.id,
        updateDto,
      );

      expect(result).toEqual(updatedRelease);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when updating to duplicate title for same artist', async () => {
      const updateDto = { title: 'Existing Album Title' };
      const existingRelease = {
        id: 'different-id',
        title: 'Existing Album Title',
        artistId: mockRelease.artistId,
      };

      mockRepository.findOne
        .mockResolvedValueOnce(mockRelease) // findOneByArtist call
        .mockResolvedValueOnce(existingRelease); // duplicate check call

      await expect(
        service.updateByArtist(mockRelease.artistId, mockRelease.id, updateDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should update with date conversion', async () => {
      const updateDto = { releaseDate: '2024-01-01' };

      mockRepository.findOne.mockResolvedValue(mockRelease);
      mockRepository.save.mockResolvedValue(mockRelease);

      await service.updateByArtist(
        mockRelease.artistId,
        mockRelease.id,
        updateDto,
      );

      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('addSongsByArtist', () => {
    it('should add songs to release by artist', async () => {
      const newSongs = ['song3', 'song4'];
      const freshMockRelease = {
        ...mockRelease,
        songIds: ['song1', 'song2'], // Reset to original state
      };
      const updatedRelease = {
        ...freshMockRelease,
        songIds: [...freshMockRelease.songIds, ...newSongs],
      };

      mockRepository.findOne.mockResolvedValue(freshMockRelease);
      mockRepository.save.mockResolvedValue(updatedRelease);

      const result = await service.addSongsByArtist(
        freshMockRelease.artistId,
        freshMockRelease.id,
        newSongs,
      );

      expect(result).toEqual(updatedRelease);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...freshMockRelease,
        songIds: ['song1', 'song2', 'song3', 'song4'],
      });
    });

    it('should not add duplicate songs', async () => {
      const duplicateSongs = ['song1', 'song3'];
      const expectedSongIds = ['song1', 'song2', 'song3'];
      const freshMockRelease = {
        ...mockRelease,
        songIds: ['song1', 'song2'], // Reset to original state
      };

      mockRepository.findOne.mockResolvedValue(freshMockRelease);
      mockRepository.save.mockResolvedValue({
        ...freshMockRelease,
        songIds: expectedSongIds,
      });

      await service.addSongsByArtist(
        freshMockRelease.artistId,
        freshMockRelease.id,
        duplicateSongs,
      );

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...freshMockRelease,
        songIds: expectedSongIds,
      });
    });
  });

  describe('removeSongsByArtist', () => {
    it('should remove songs from release by artist', async () => {
      const songsToRemove = ['song1'];
      const freshMockRelease = {
        ...mockRelease,
        songIds: ['song1', 'song2'], // Reset to original state
      };
      const updatedRelease = {
        ...freshMockRelease,
        songIds: ['song2'],
      };

      mockRepository.findOne.mockResolvedValue(freshMockRelease);
      mockRepository.save.mockResolvedValue(updatedRelease);

      const result = await service.removeSongsByArtist(
        freshMockRelease.artistId,
        freshMockRelease.id,
        songsToRemove,
      );

      expect(result).toEqual(updatedRelease);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...freshMockRelease,
        songIds: ['song2'],
      });
    });
  });

  describe('removeByArtist', () => {
    it('should remove a release by artist', async () => {
      mockRepository.findOne.mockResolvedValue(mockRelease);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.removeByArtist(mockRelease.artistId, mockRelease.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockRelease.id, artistId: mockRelease.artistId },
        relations: ['artist'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockRelease);
    });
  });

  describe('search', () => {
    const mockSearchResults: Release[] = [
      {
        id: '1',
        title: 'Test Release',
        type: ReleaseType.ALBUM,
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
      mockRepository.findAndCount.mockResolvedValue([mockSearchResults, 2]);

      const result = await service.search('Test', 20, 1);

      expect(mockRepository.findAndCount).toHaveBeenCalled();
      expect(result).toEqual(mockSearchResults);
      expect(result).toHaveLength(2);
    });

    it('should handle pagination correctly', async () => {
      mockRepository.findAndCount.mockResolvedValue([
        [mockSearchResults[0]],
        1,
      ]);

      const result = await service.search('Release', 1, 2);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 1,
          skip: 1,
        }),
      );
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no releases match', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.search('NonExistent', 20, 1);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });
});
