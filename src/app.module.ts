import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule} from '@nestjs/config';
import {TypeOrmModule}from '@nestjs/typeorm';
import { PaymentsModule } from './payments/payments.module';
import { SupabaseService } from './supabase.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
    }),
    PaymentsModule,
  ],
  // controllers: [AppController],
  // providers: [AppService],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class AppModule {}
