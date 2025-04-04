import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3001', 'other-allowed-origins'],
    methods: 'GET , HEAD , PUT , PATCH, POST, DELETE',
    credentials: true,
  });
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();

// app.service.ts - Basic service
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello from Neon PostgreSQL!';
  }
}
