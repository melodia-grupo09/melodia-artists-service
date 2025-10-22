import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
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
    // Check if artist with this ID already exists
    const existingArtistById = await this.artistsRepository.findOne({
      where: { id: createArtistDto.id },
    });

    if (existingArtistById) {
      throw new BadRequestException(
        `Artist with ID '${createArtistDto.id}' already exists`,
      );
    }

    // Check if artist with this name already exists
    const existingArtistByName = await this.artistsRepository.findOne({
      where: { name: createArtistDto.name },
    });

    if (existingArtistByName) {
      throw new BadRequestException(
        `Artist with name '${createArtistDto.name}' already exists`,
      );
    }

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

    if (updateArtistDto.name && updateArtistDto.name !== artist.name) {
      const existingArtist = await this.artistsRepository.findOne({
        where: { name: updateArtistDto.name },
      });

      if (existingArtist) {
        throw new BadRequestException(
          `Artist with name '${updateArtistDto.name}' already exists`,
        );
      }
    }

    Object.assign(artist, updateArtistDto);
    return this.artistsRepository.save(artist);
  }

  async updateMedia(
    id: string,
    imageUrl?: string,
    coverUrl?: string,
  ): Promise<Artist> {
    const artist = await this.findOne(id);

    if (imageUrl) {
      artist.imageUrl = imageUrl;
    }

    if (coverUrl) {
      artist.coverUrl = coverUrl;
    }

    return this.artistsRepository.save(artist);
  }

  async remove(id: string): Promise<void> {
    const artist = await this.findOne(id);
    await this.artistsRepository.remove(artist);
  }

  async search(query: string, limit: number, page: number): Promise<Artist[]> {
    const skip = (page - 1) * limit;

    const [artists] = await this.artistsRepository.findAndCount({
      where: [{ name: ILike(`%${query}%`) }, { bio: ILike(`%${query}%`) }],
      take: limit,
      skip: skip,
      order: {
        followersCount: 'DESC',
        name: 'ASC',
      },
    });

    return artists;
  }

  async incrementFollowers(id: string): Promise<Artist> {
    const artist = await this.findOne(id);
    artist.followersCount += 1;
    return this.artistsRepository.save(artist);
  }

  async decrementFollowers(id: string): Promise<Artist> {
    const artist = await this.findOne(id);
    if (artist.followersCount > 0) {
      artist.followersCount -= 1;
    }
    return this.artistsRepository.save(artist);
  }
}
