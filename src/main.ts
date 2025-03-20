import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv'


dotenv.config()
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


  console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('SUPABASE_DB_URL:', process.env.SUPABASE_DB_URL);
  console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY);
  // Initialize Supabase
  const supabase = createClient(
    configService.get<string>('SUPABASE_URL') || '',
    configService.get<string>('SUPABASE_ANON_KEY') || '',
  );

  app.setGlobalPrefix('api'); 

  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log('Connecting to:', process.env.SUPABASE_DB_URL);
}

bootstrap();
