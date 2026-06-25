import { Module } from '@nestjs/common';
import { TmdbModule } from '../tmdb/tmdb.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [TmdbModule],
  controllers: [AdminController],
})
export class AdminModule {}
