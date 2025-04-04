import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetBorrowerDefaults1650000000000 implements MigrationInterface {
  name = 'SetBorrowerDefaults1650000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. First check if columns exist and have NULL values
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'borrower' AND column_name = 'name') THEN
          UPDATE "borrower" SET "name" = 'Unknown Borrower' WHERE "name" IS NULL;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'borrower' AND column_name = 'email') THEN
          UPDATE "borrower" SET "email" = CONCAT('user_', id::text, '@example.com') 
          WHERE "email" IS NULL;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'borrower' AND column_name = 'phone') THEN
          UPDATE "borrower" SET "phone" = '000-000-0000' WHERE "phone" IS NULL;
        END IF;
      END $$;
    `);

    // 2. Add constraints in a transaction for safety
    await queryRunner.query('BEGIN');
    try {
      await queryRunner.query(`
        ALTER TABLE "borrower" 
        ALTER COLUMN "name" SET NOT NULL
      `);

      await queryRunner.query(`
        ALTER TABLE "borrower" 
        ALTER COLUMN "email" SET NOT NULL
      `);

      await queryRunner.query(`
        ALTER TABLE "borrower" 
        ALTER COLUMN "phone" SET NOT NULL
      `);

      // Add unique constraint separately for better error handling
      await queryRunner.query(`
        ALTER TABLE "borrower" 
        ADD CONSTRAINT "UQ_borrower_email" UNIQUE ("email")
      `);

      await queryRunner.query('COMMIT');
    } catch (err) {
      await queryRunner.query('ROLLBACK');
      throw err;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "borrower" 
      ALTER COLUMN "name" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "borrower" 
      ALTER COLUMN "email" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "borrower" 
      ALTER COLUMN "phone" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "borrower" 
      DROP CONSTRAINT IF EXISTS "UQ_borrower_email"
    `);
  }
}
