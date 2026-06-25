import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
