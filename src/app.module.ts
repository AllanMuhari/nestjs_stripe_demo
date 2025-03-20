import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsModule } from './payments/payments.module';
import { SupabaseService } from './supabase.service';

const databaseUrl = process.env.DATABASE_URL;
console.log('🔍 DATABASE_URL:', databaseUrl);

if (!databaseUrl) {
  throw new Error('❌ DATABASE_URL is not defined! Check your .env file.');
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: databaseUrl,
      autoLoadEntities: true,
      synchronize: true,
    }),
    PaymentsModule,
  ],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class AppModule {}
