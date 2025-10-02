import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from './entities/artist.entity';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist)
    private artistsRepository: Repository<Artist>,
  ) {}

  async create(createArtistDto: CreateArtistDto): Promise<Artist> {
    const artist = this.artistsRepository.create(createArtistDto);
    return this.artistsRepository.save(artist);
  }

  async findOne(id: string): Promise<Artist> {
    const artist = await this.artistsRepository.findOne({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }

    return artist;
  }

  async update(id: string, updateArtistDto: UpdateArtistDto): Promise<Artist> {
    const artist = await this.findOne(id);

    Object.assign(artist, updateArtistDto);
    return this.artistsRepository.save(artist);
  }

  async updateImage(id: string, imageUrl: string): Promise<Artist> {
    const artist = await this.findOne(id);
    artist.imageUrl = imageUrl;
    return this.artistsRepository.save(artist);
  }

  async updateCover(id: string, coverUrl: string): Promise<Artist> {
    const artist = await this.findOne(id);
    artist.coverUrl = coverUrl;
    return this.artistsRepository.save(artist);
  }

  async remove(id: string): Promise<void> {
    const artist = await this.findOne(id);
    await this.artistsRepository.remove(artist);
  }
}
