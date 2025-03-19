import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import { IncomingMessage } from 'http';

declare module 'http' {
  interface IncomingMessage {
    rawBody: Buffer;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.use(bodyParser.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
