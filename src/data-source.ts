import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Borrower } from './borrowers/entities/borrower.entity';
import { Payment } from './payments/entities/payments.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Borrower,Payment],
  migrations: ['src/migrations/*.ts'],
ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  synchronize: false, // Disable sync to use migrations
  logging: true,
});
