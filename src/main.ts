import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.use(
    bodyParser.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  // Initialize Supabase
  const supabase = createClient(
    configService.get<string>('SUPABASE_URL') || '',
    configService.get<string>('SUPABASE_ANON_KEY') || '',
  );

  app.setGlobalPrefix('api'); 

  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap();
