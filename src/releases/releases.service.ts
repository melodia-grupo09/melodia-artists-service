import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      order: { releaseDate: 'DESC' },
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
      order: { releaseDate: 'DESC' },
    });
  }

  async findByArtistAndType(
    artistId: string,
    type: ReleaseType,
  ): Promise<Release[]> {
    return this.releasesRepository.find({
      where: { artistId, type },
      relations: ['artist'],
      order: { releaseDate: 'DESC' },
    });
  }

  async update(
    id: string,
    updateReleaseDto: UpdateReleaseDto,
  ): Promise<Release> {
    const release = await this.findOne(id);

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
}
