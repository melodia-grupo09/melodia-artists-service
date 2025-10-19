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
        name: 'Test Artist',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockArtist);
      mockRepository.save.mockResolvedValue(mockArtist);

      const result = await service.create(createArtistDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: createArtistDto.name },
      });
      expect(repository.create).toHaveBeenCalledWith(createArtistDto);
      expect(repository.save).toHaveBeenCalledWith(mockArtist);
      expect(result).toEqual(mockArtist);
    });

    it('should throw BadRequestException when artist with same name already exists', async () => {
      const createArtistDto: CreateArtistDto = {
        name: 'Test Artist',
      };

      mockRepository.findOne.mockResolvedValue(mockArtist);

      await expect(service.create(createArtistDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createArtistDto)).rejects.toThrow(
        `Artist with name '${createArtistDto.name}' already exists`,
      );

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
});
