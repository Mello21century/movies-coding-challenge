import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Express, Request, Response } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers (CSP disabled so Swagger UI assets load)
  app.use(helmet({ contentSecurityPolicy: false }));

  // Strip unknown props, transform payloads to DTO types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // All routes under /api
  app.setGlobalPrefix('api');

  app.enableShutdownHooks();

  // Friendly root → API docs
  const expressApp = app.getHttpAdapter().getInstance() as Express;
  expressApp.get('/', (_req: Request, res: Response) =>
    res.redirect('/api/docs'),
  );

  // Swagger / OpenAPI docs at /api/docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('KIB Movies API')
    .setDescription(
      'CRUD API over TMDB data: movies, ratings, watchlist, auth.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 8080);
  await app.listen(port);
}
void bootstrap();
