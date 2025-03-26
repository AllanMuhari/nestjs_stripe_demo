import { MigrationInterface, QueryRunner } from "typeorm";

export class BorrowersInit1742965234958 implements MigrationInterface {
    name = 'BorrowersInit1742965234958'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "borrower" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "loanAmount" integer NOT NULL, "repaymentPlan" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0b2149b696c042d5432bb288001" UNIQUE ("email"), CONSTRAINT "PK_c9737036f657d00897e09029378" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "borrower"`);
    }

}
