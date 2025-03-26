import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeEmailNullable1742970206091 implements MigrationInterface {
    name = 'MakeEmailNullable1742970206091'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "borrower" ALTER COLUMN "email" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "borrower" ALTER COLUMN "email" SET NOT NULL`);
    }

}
