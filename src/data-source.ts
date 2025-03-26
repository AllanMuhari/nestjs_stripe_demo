import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Borrower } from './borrowers/borrowers.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Borrower],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // Disable sync to use migrations
  logging: true,
});
