import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeNameNullable1742969828837 implements MigrationInterface {
    name = 'MakeNameNullable1742969828837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "borrower" ALTER COLUMN "name" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "borrower" ALTER COLUMN "name" SET NOT NULL`);
    }

}
