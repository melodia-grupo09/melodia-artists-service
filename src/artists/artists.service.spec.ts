/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { Artist } from './entities/artist.entity';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

describe('ArtistsService', () => {
  let service: ArtistsService;
  let repository: Repository<Artist>;

  const mockArtist: Artist = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Artist',
    imageUrl: 'http://example.com/image.jpg',
    coverUrl: 'http://example.com/cover.jpg',
    followersCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    releases: [],
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtistsService,
        {
          provide: getRepositoryToken(Artist),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ArtistsService>(ArtistsService);
    repository = module.get<Repository<Artist>>(getRepositoryToken(Artist));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return an artist', async () => {
      const createArtistDto: CreateArtistDto = {
        id: 'test-artist-id-123',
        name: 'Test Artist',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockArtist);
      mockRepository.save.mockResolvedValue(mockArtist);

      const result = await service.create(createArtistDto);

      // Should check both ID and name for duplicates
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: createArtistDto.id },
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: createArtistDto.name },
      });
      expect(repository.create).toHaveBeenCalledWith(createArtistDto);
      expect(repository.save).toHaveBeenCalledWith(mockArtist);
      expect(result).toEqual(mockArtist);
    });

    it('should throw BadRequestException when artist with same ID already exists', async () => {
      const createArtistDto: CreateArtistDto = {
        id: 'existing-artist-id',
        name: 'Test Artist',
      };

      // Mock to return existing artist when checking for ID
      mockRepository.findOne.mockImplementation((options: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (options.where.id) {
          return Promise.resolve(mockArtist); // ID already exists
        }
        return Promise.resolve(null);
      });

      await expect(service.create(createArtistDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createArtistDto)).rejects.toThrow(
        `Artist with ID '${createArtistDto.id}' already exists`,
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: createArtistDto.id },
      });
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when artist with same name already exists', async () => {
      const createArtistDto: CreateArtistDto = {
        id: 'new-artist-id',
        name: 'Test Artist',
      };

      // Mock to return null for ID check but existing artist for name check
      mockRepository.findOne.mockImplementation((options: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (options.where.id) {
          return Promise.resolve(null); // ID is new
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (options.where.name) {
          return Promise.resolve(mockArtist); // Name already exists
        }
        return Promise.resolve(null);
      });

      await expect(service.create(createArtistDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createArtistDto)).rejects.toThrow(
        `Artist with name '${createArtistDto.name}' already exists`,
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: createArtistDto.id },
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: createArtistDto.name },
      });
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an artist when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockArtist);

      const result = await service.findOne(mockArtist.id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockArtist.id },
      });
      expect(result).toEqual(mockArtist);
    });

    it('should throw NotFoundException when artist not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Artist with ID non-existent-id not found',
      );
    });
  });

  describe('update', () => {
    it('should update and return an artist', async () => {
      const updateArtistDto: UpdateArtistDto = {
        name: 'Updated Artist Name',
      };

      const updatedArtist = { ...mockArtist, name: 'Updated Artist Name' };

      mockRepository.findOne
        .mockResolvedValueOnce(mockArtist)
        .mockResolvedValueOnce(null);
      mockRepository.save.mockResolvedValue(updatedArtist);

      const result = await service.update(mockArtist.id, updateArtistDto);

      expect(repository.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: mockArtist.id },
      });
      expect(repository.findOne).toHaveBeenNthCalledWith(2, {
        where: { name: updateArtistDto.name },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockArtist,
        ...updateArtistDto,
      });
      expect(result).toEqual(updatedArtist);
    });

    it('should throw NotFoundException when artist not found for update', async () => {
      const updateArtistDto: UpdateArtistDto = {
        name: 'Updated Artist Name',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateArtistDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when trying to update name to existing artist name', async () => {
      const updateArtistDto: UpdateArtistDto = {
        name: 'Existing Artist Name',
      };

      const existingArtist = {
        ...mockArtist,
        id: 'different-id',
        name: 'Existing Artist Name',
      };

      jest.clearAllMocks();
      mockRepository.findOne
        .mockResolvedValueOnce(mockArtist)
        .mockResolvedValueOnce(existingArtist);

      await expect(
        service.update(mockArtist.id, updateArtistDto),
      ).rejects.toThrow(BadRequestException);

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should update artist when name is not being changed', async () => {
      const updateArtistDto: UpdateArtistDto = {};

      const updatedArtist = { ...mockArtist };

      mockRepository.findOne.mockResolvedValue(mockArtist);
      mockRepository.save.mockResolvedValue(updatedArtist);

      const result = await service.update(mockArtist.id, updateArtistDto);

      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockArtist.id },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockArtist,
        ...updateArtistDto,
      });
      expect(result).toEqual(updatedArtist);
    });

    it('should update artist when name is the same as current name', async () => {
      const updateArtistDto: UpdateArtistDto = {
        name: mockArtist.name,
      };

      const updatedArtist = { ...mockArtist };

      mockRepository.findOne.mockResolvedValue(mockArtist);
      mockRepository.save.mockResolvedValue(updatedArtist);

      const result = await service.update(mockArtist.id, updateArtistDto);

      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith({
        ...mockArtist,
        ...updateArtistDto,
      });
      expect(result).toEqual(updatedArtist);
    });
  });

  describe('updateMedia', () => {
    it('should update artist image only and return updated artist', async () => {
      const newImageUrl = 'http://example.com/new-image.jpg';
      const updatedArtist = { ...mockArtist, imageUrl: newImageUrl };

      mockRepository.findOne.mockResolvedValue(mockArtist);
      mockRepository.save.mockResolvedValue(updatedArtist);

      const result = await service.updateMedia(mockArtist.id, newImageUrl);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockArtist.id },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockArtist,
        imageUrl: newImageUrl,
      });
      expect(result).toEqual(updatedArtist);
    });

    it('should update artist cover only and return updated artist', async () => {
      const newCoverUrl = 'http://example.com/new-cover.jpg';
      const updatedArtist = { ...mockArtist, coverUrl: newCoverUrl };

      mockRepository.findOne.mockResolvedValue(mockArtist);
      mockRepository.save.mockResolvedValue(updatedArtist);

      const result = await service.updateMedia(
        mockArtist.id,
        undefined,
        newCoverUrl,
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockArtist.id },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockArtist,
        coverUrl: newCoverUrl,
      });
      expect(result).toEqual(updatedArtist);
    });

    it('should update both image and cover and return updated artist', async () => {
      const newImageUrl = 'http://example.com/new-image.jpg';
      const newCoverUrl = 'http://example.com/new-cover.jpg';
      const updatedArtist = {
        ...mockArtist,
        imageUrl: newImageUrl,
        coverUrl: newCoverUrl,
      };

      mockRepository.findOne.mockResolvedValue(mockArtist);
      mockRepository.save.mockResolvedValue(updatedArtist);

      const result = await service.updateMedia(
        mockArtist.id,
        newImageUrl,
        newCoverUrl,
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockArtist.id },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockArtist,
        imageUrl: newImageUrl,
        coverUrl: newCoverUrl,
      });
      expect(result).toEqual(updatedArtist);
    });

    it('should not update anything when no URLs provided', async () => {
      mockRepository.findOne.mockResolvedValue(mockArtist);
      mockRepository.save.mockResolvedValue(mockArtist);

      const result = await service.updateMedia(mockArtist.id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockArtist.id },
      });
      expect(repository.save).toHaveBeenCalledWith(mockArtist);
      expect(result).toEqual(mockArtist);
    });
  });

  describe('remove', () => {
    it('should remove an artist', async () => {
      mockRepository.findOne.mockResolvedValue(mockArtist);
      mockRepository.remove.mockResolvedValue(mockArtist);

      await service.remove(mockArtist.id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockArtist.id },
      });
      expect(repository.remove).toHaveBeenCalledWith(mockArtist);
    });

    it('should throw NotFoundException when artist not found for removal', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('search', () => {
    const mockSearchResults: Artist[] = [
      {
        id: '1',
        name: 'Test Artist',
        imageUrl: 'http://example.com/image.jpg',
        coverUrl: 'http://example.com/cover.jpg',
        followersCount: 1000,
        bio: 'Test bio',
        socialLinks: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        releases: [],
      },
      {
        id: '2',
        name: 'Another Artist',
        imageUrl: 'http://example.com/image2.jpg',
        coverUrl: 'http://example.com/cover2.jpg',
        followersCount: 500,
        bio: 'Another bio',
        socialLinks: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        releases: [],
      },
    ];

    it('should return artists matching the search query', async () => {
      mockRepository.findAndCount.mockResolvedValue([mockSearchResults, 2]);

      const result = await service.search('Test', 20, 1);

      expect(repository.findAndCount).toHaveBeenCalled();
      expect(result).toEqual(mockSearchResults);
      expect(result).toHaveLength(2);
    });

    it('should handle pagination correctly', async () => {
      mockRepository.findAndCount.mockResolvedValue([
        [mockSearchResults[0]],
        1,
      ]);

      const result = await service.search('Artist', 1, 2);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 1,
          skip: 1,
        }),
      );
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no artists match', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.search('NonExistent', 20, 1);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('incrementFollowers', () => {
    it('should increment followers count', async () => {
      const mockArtist: Artist = {
        id: '1',
        name: 'Test Artist',
        imageUrl: 'http://example.com/image.jpg',
        coverUrl: undefined,
        followersCount: 100,
        bio: undefined,
        socialLinks: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        releases: [],
      };

      mockRepository.findOne.mockResolvedValue(mockArtist);
      mockRepository.save.mockResolvedValue({
        ...mockArtist,
        followersCount: 101,
      });

      const result = await service.incrementFollowers('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(repository.save).toHaveBeenCalled();
      expect(result.followersCount).toBe(101);
    });

    it('should throw NotFoundException if artist not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.incrementFollowers('non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('decrementFollowers', () => {
    it('should decrement followers count', async () => {
      const mockArtist: Artist = {
        id: '1',
        name: 'Test Artist',
        imageUrl: 'http://example.com/image.jpg',
        coverUrl: undefined,
        followersCount: 100,
        bio: undefined,
        socialLinks: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        releases: [],
      };

      mockRepository.findOne.mockResolvedValue(mockArtist);
      mockRepository.save.mockResolvedValue({
        ...mockArtist,
        followersCount: 99,
      });

      const result = await service.decrementFollowers('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(repository.save).toHaveBeenCalled();
      expect(result.followersCount).toBe(99);
    });

    it('should not decrement below zero', async () => {
      const mockArtist: Artist = {
        id: '1',
        name: 'Test Artist',
        imageUrl: 'http://example.com/image.jpg',
        coverUrl: undefined,
        followersCount: 0,
        bio: undefined,
        socialLinks: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        releases: [],
      };

      mockRepository.findOne.mockResolvedValue(mockArtist);
      mockRepository.save.mockResolvedValue(mockArtist);

      const result = await service.decrementFollowers('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(repository.save).toHaveBeenCalled();
      expect(result.followersCount).toBe(0);
    });

    it('should throw NotFoundException if artist not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.decrementFollowers('non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
