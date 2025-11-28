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

  async getRelatedArtists(id: string): Promise<Artist[]> {
    const artist = await this.artistsRepository.findOne({
      where: { id },
      relations: ['releases'],
    });

    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }

    const genres = new Set<string>();
    if (artist.releases) {
      artist.releases.forEach((release) => {
        if (release.genres) {
          release.genres.forEach((genre) => genres.add(genre));
        }
      });
    }

    if (genres.size === 0) {
      return [];
    }

    const genreArray = Array.from(genres);

    const qb = this.artistsRepository.createQueryBuilder('artist');
    qb.innerJoin('artist.releases', 'release');
    qb.where('artist.id != :id', { id });
    qb.andWhere('release.genres && :genres', { genres: genreArray });

    qb.groupBy('artist.id');
    qb.addGroupBy('artist.name');
    qb.addGroupBy('artist.imageUrl');
    qb.addGroupBy('artist.followersCount');

    qb.select([
      'artist.id',
      'artist.name',
      'artist.imageUrl',
      'artist.followersCount',
    ]);

    qb.addSelect('MAX(release.releaseDate)', 'lastReleaseDate');
    qb.orderBy('MAX(release.releaseDate)', 'DESC');
    qb.addOrderBy('artist.followersCount', 'DESC');

    qb.limit(20);

    const rawResults = await qb.getRawMany();

    const artists = rawResults.map((raw) => {
      const a = new Artist();
      a.id = raw.artist_id;
      a.name = raw.artist_name;
      a.imageUrl = raw.artist_imageUrl;
      a.followersCount = raw.artist_followersCount;
      return a;
    });

    if (artists.length <= 3) {
      return artists;
    }

    const top3 = artists.slice(0, 3);
    const rest = artists.slice(3);

    const seed = Math.floor(Date.now() / (1000 * 60 * 60));
    const shuffledRest = this.shuffleWithSeed(rest, seed);

    return [...top3, ...shuffledRest];
  }

  private shuffleWithSeed<T>(array: T[], seed: number): T[] {
    let m = array.length,
      t,
      i;

    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    while (m) {
      i = Math.floor(random() * m--);
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }

    return array;
  }
}
