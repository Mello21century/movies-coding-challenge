import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SyncService } from './tmdb/sync.service';

/**
 * Standalone seed entrypoint: boots a Nest application context (no HTTP server),
 * runs a full TMDB sync, then exits. Run with `npm run seed`.
 */
async function bootstrap() {
  const logger = new Logger('Seed');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const pages = Number(process.env.SEED_PAGES ?? 5);
    logger.log(`Seeding TMDB data (${pages} page(s) of popular movies)`);
    await app.get(SyncService).syncAll(pages);
    logger.log('Seed complete');
  } catch (err) {
    logger.error('Seed failed', err instanceof Error ? err.stack : err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void bootstrap();
