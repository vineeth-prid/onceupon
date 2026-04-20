import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { mkdirSync } from 'fs';

async function bootstrap() {
  // Ensure uploads directory exists
  const uploadsDir = join(process.cwd(), 'uploads');
  mkdirSync(uploadsDir, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');

  // Serve uploaded files at /api/uploads so they go through the same
  // Nginx proxy rule as regular API routes — no extra Nginx config needed.
  app.useStaticAssets(uploadsDir, { prefix: '/api/uploads' });

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Server running on http://127.0.0.1:${port}`);
}
bootstrap();