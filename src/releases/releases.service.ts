import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Release, ReleaseType } from './entities/release.entity';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';

@Injectable()
export class ReleasesService {
  constructor(
    @InjectRepository(Release)
    private releasesRepository: Repository<Release>,
  ) {}

  async create(createReleaseDto: CreateReleaseDto): Promise<Release> {
    // Check if a release with the same title already exists for this artist
    const existingRelease = await this.releasesRepository.findOne({
      where: {
        title: createReleaseDto.title,
        artistId: createReleaseDto.artistId,
      },
    });

    if (existingRelease) {
      throw new ConflictException(
        `A release with the title "${createReleaseDto.title}" already exists for this artist`,
      );
    }

    const release = this.releasesRepository.create({
      ...createReleaseDto,
      releaseDate: new Date(createReleaseDto.releaseDate),
      songIds: createReleaseDto.songIds || [],
    });
    return this.releasesRepository.save(release);
  }

  async findAll(): Promise<Release[]> {
    return this.releasesRepository.find({
      relations: ['artist'],
      order: {
        releaseDate: 'DESC',
        title: 'ASC', // If tie we choose by alphabethic order
      },
    });
  }

  async findOne(id: string): Promise<Release> {
    const release = await this.releasesRepository.findOne({
      where: { id },
      relations: ['artist'],
    });

    if (!release) {
      throw new NotFoundException(`Release with ID ${id} not found`);
    }

    return release;
  }

  async findByArtist(artistId: string): Promise<Release[]> {
    return this.releasesRepository.find({
      where: { artistId },
      relations: ['artist'],
      order: {
        releaseDate: 'DESC',
        title: 'ASC', // If tie we choose by alphabethic order
      },
    });
  }

  async findByArtistAndType(
    artistId: string,
    type: ReleaseType,
  ): Promise<Release[]> {
    return this.releasesRepository.find({
      where: { artistId, type },
      relations: ['artist'],
      order: {
        releaseDate: 'DESC',
        title: 'ASC', // If tie we choose by alphabethic order
      },
    });
  }

  async findLatestByArtist(artistId: string): Promise<Release | null> {
    const latestRelease = await this.releasesRepository.findOne({
      where: { artistId },
      relations: ['artist'],
      order: {
        releaseDate: 'DESC',
        title: 'ASC',
      },
    });

    return latestRelease;
  }

  async findByArtistWithLatestFlag(
    artistId: string,
  ): Promise<(Release & { isLatest: boolean })[]> {
    const releases = await this.findByArtist(artistId);

    if (releases.length === 0) {
      return [];
    }

    const latestReleaseDate = releases[0].releaseDate;

    return releases.map((release, index) => ({
      ...release,
      isLatest:
        index === 0 ||
        release.releaseDate.getTime() === latestReleaseDate.getTime(),
    }));
  }

  async update(
    id: string,
    updateReleaseDto: UpdateReleaseDto,
  ): Promise<Release> {
    const release = await this.findOne(id);

    // Check if the title is being updated and if it conflicts with existing releases
    if (updateReleaseDto.title && updateReleaseDto.title !== release.title) {
      const existingRelease = await this.releasesRepository.findOne({
        where: {
          title: updateReleaseDto.title,
          artistId: release.artistId,
        },
      });

      if (existingRelease && existingRelease.id !== id) {
        throw new ConflictException(
          `A release with the title "${updateReleaseDto.title}" already exists for this artist`,
        );
      }
    }

    const updateData: UpdateReleaseDto = { ...updateReleaseDto };
    if (updateReleaseDto.releaseDate) {
      updateData.releaseDate = new Date(
        updateReleaseDto.releaseDate,
      ).toISOString();
    }

    Object.assign(release, updateData);
    return this.releasesRepository.save(release);
  }

  async addSongs(id: string, songIds: string[]): Promise<Release> {
    const release = await this.findOne(id);
    const uniqueSongIds = [...new Set([...release.songIds, ...songIds])];
    release.songIds = uniqueSongIds;
    return this.releasesRepository.save(release);
  }

  async removeSongs(id: string, songIds: string[]): Promise<Release> {
    const release = await this.findOne(id);
    release.songIds = release.songIds.filter((id) => !songIds.includes(id));
    return this.releasesRepository.save(release);
  }

  async remove(id: string): Promise<void> {
    const release = await this.findOne(id);
    await this.releasesRepository.remove(release);
  }

  async findOneByArtist(artistId: string, releaseId: string): Promise<Release> {
    const release = await this.releasesRepository.findOne({
      where: { id: releaseId, artistId },
      relations: ['artist'],
    });

    if (!release) {
      throw new NotFoundException(
        `Release with ID ${releaseId} not found for artist ${artistId}`,
      );
    }

    return release;
  }

  async updateByArtist(
    artistId: string,
    releaseId: string,
    updateReleaseDto: UpdateReleaseDto,
  ): Promise<Release> {
    const release = await this.findOneByArtist(artistId, releaseId);

    // Check if the title is being updated and if it conflicts with existing releases
    if (updateReleaseDto.title && updateReleaseDto.title !== release.title) {
      const existingRelease = await this.releasesRepository.findOne({
        where: {
          title: updateReleaseDto.title,
          artistId: artistId,
        },
      });

      if (existingRelease && existingRelease.id !== releaseId) {
        throw new ConflictException(
          `A release with the title "${updateReleaseDto.title}" already exists for this artist`,
        );
      }
    }

    const updateData: UpdateReleaseDto = { ...updateReleaseDto };
    if (updateReleaseDto.releaseDate) {
      updateData.releaseDate = new Date(
        updateReleaseDto.releaseDate,
      ).toISOString();
    }

    Object.assign(release, updateData);
    return this.releasesRepository.save(release);
  }

  async addSongsByArtist(
    artistId: string,
    releaseId: string,
    songIds: string[],
  ): Promise<Release> {
    const release = await this.findOneByArtist(artistId, releaseId);
    const uniqueSongIds = [...new Set([...release.songIds, ...songIds])];
    release.songIds = uniqueSongIds;
    return this.releasesRepository.save(release);
  }

  async removeSongsByArtist(
    artistId: string,
    releaseId: string,
    songIds: string[],
  ): Promise<Release> {
    const release = await this.findOneByArtist(artistId, releaseId);
    release.songIds = release.songIds.filter((id) => !songIds.includes(id));
    return this.releasesRepository.save(release);
  }

  async removeByArtist(artistId: string, releaseId: string): Promise<void> {
    const release = await this.findOneByArtist(artistId, releaseId);
    await this.releasesRepository.remove(release);
  }

  async search(query: string, limit: number, page: number): Promise<Release[]> {
    const skip = (page - 1) * limit;

    const [releases] = await this.releasesRepository.findAndCount({
      where: [{ title: ILike(`%${query}%`) }],
      relations: ['artist'],
      take: limit,
      skip: skip,
      order: {
        releaseDate: 'DESC',
        title: 'ASC',
      },
    });

    return releases;
  }
}
