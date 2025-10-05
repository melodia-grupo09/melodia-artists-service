import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReleasesService } from './releases.service';
import { Release } from './entities/release.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Release]), UploadModule],
  controllers: [],
  providers: [ReleasesService],
  exports: [ReleasesService],
})
export class ReleasesModule {}
