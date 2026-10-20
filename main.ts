import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); // every route starts with /api
  app.enableCors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' });
  // Validates every incoming body against its DTO class and strips unknown fields
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`NestNode API running on http://localhost:${port}/api`);
}
bootstrap();
