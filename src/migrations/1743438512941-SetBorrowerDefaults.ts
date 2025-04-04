// src/migrations/XXXXXXXXXXXXXX-SetBorrowerDefaults.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetBorrowerDefaults1650000000000 implements MigrationInterface {
  name = 'SetBorrowerDefaults1650000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Set default values for NULL columns first
    await queryRunner.query(`
            UPDATE "borrower" 
            SET "name" = 'Unknown Borrower'
            WHERE "name" IS NULL
        `);

    await queryRunner.query(`
            UPDATE "borrower" 
            SET "email" = CONCAT('user_', id::text, '@example.com')
            WHERE "email" IS NULL
        `);

    await queryRunner.query(`
            UPDATE "borrower" 
            SET "phone" = '000-000-0000'
            WHERE "phone" IS NULL
        `);

    // Now alter columns to be NOT NULL
    await queryRunner.query(`
            ALTER TABLE "borrower" 
            ALTER COLUMN "name" SET NOT NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "borrower" 
            ALTER COLUMN "email" SET NOT NULL,
            ADD CONSTRAINT "UQ_borrower_email" UNIQUE ("email")
        `);

    await queryRunner.query(`
            ALTER TABLE "borrower" 
            ALTER COLUMN "phone" SET NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the changes
    await queryRunner.query(`
            ALTER TABLE "borrower" 
            ALTER COLUMN "name" DROP NOT NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "borrower" 
            ALTER COLUMN "email" DROP NOT NULL,
            DROP CONSTRAINT IF EXISTS "UQ_borrower_email"
        `);

    await queryRunner.query(`
            ALTER TABLE "borrower" 
            ALTER COLUMN "phone" DROP NOT NULL
        `);
  }
}
