import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Artist } from '../../artists/entities/artist.entity';

export enum ReleaseType {
  ALBUM = 'album',
  SINGLE = 'single',
  EP = 'ep',
}

@Entity('releases')
export class Release {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({
    type: 'enum',
    enum: ReleaseType,
    default: ReleaseType.ALBUM,
  })
  type: ReleaseType;

  @Column({ type: 'date' })
  releaseDate: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  coverUrl?: string;

  @ManyToOne(() => Artist, (artist) => artist.releases)
  @JoinColumn({ name: 'artistId' })
  artist: Artist;

  @Column('uuid')
  artistId: string;

  @Column('text', { array: true, default: '{}' })
  songIds: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
