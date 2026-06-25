import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SyncService } from './sync.service';
import { TmdbService } from './tmdb.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseURL: config.get<string>('TMDB_BASE_URL'),
        headers: {
          Authorization: `Bearer ${config.get<string>('TMDB_API_TOKEN')}`,
        },
        timeout: 10_000,
      }),
    }),
  ],
  providers: [SyncService, TmdbService],
  exports: [SyncService, TmdbService],
})
export class TmdbModule {}
