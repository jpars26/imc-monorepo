import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1757533047674 implements MigrationInterface {
    name = 'Init1757533047674'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "avaliacoes" ("id" varchar PRIMARY KEY NOT NULL, "alturaM" real NOT NULL, "pesoKg" real NOT NULL, "imc" real NOT NULL, "classificacao" varchar NOT NULL, "avaliadoEm" datetime NOT NULL DEFAULT (datetime('now')), "alunoId" varchar, "professorId" varchar)`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" varchar PRIMARY KEY NOT NULL, "nome" varchar NOT NULL, "email" varchar NOT NULL, "senhaHash" varchar NOT NULL, "cargo" text NOT NULL, "ativo" boolean NOT NULL DEFAULT (1), "criadoEm" datetime NOT NULL DEFAULT (datetime('now')), "atualizadoEm" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "temporary_avaliacoes" ("id" varchar PRIMARY KEY NOT NULL, "alturaM" real NOT NULL, "pesoKg" real NOT NULL, "imc" real NOT NULL, "classificacao" varchar NOT NULL, "avaliadoEm" datetime NOT NULL DEFAULT (datetime('now')), "alunoId" varchar, "professorId" varchar, CONSTRAINT "FK_3605d3b7283e830d6296effdc33" FOREIGN KEY ("alunoId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION, CONSTRAINT "FK_f09ee12fa4a31c579a07d2e161e" FOREIGN KEY ("professorId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_avaliacoes"("id", "alturaM", "pesoKg", "imc", "classificacao", "avaliadoEm", "alunoId", "professorId") SELECT "id", "alturaM", "pesoKg", "imc", "classificacao", "avaliadoEm", "alunoId", "professorId" FROM "avaliacoes"`);
        await queryRunner.query(`DROP TABLE "avaliacoes"`);
        await queryRunner.query(`ALTER TABLE "temporary_avaliacoes" RENAME TO "avaliacoes"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "avaliacoes" RENAME TO "temporary_avaliacoes"`);
        await queryRunner.query(`CREATE TABLE "avaliacoes" ("id" varchar PRIMARY KEY NOT NULL, "alturaM" real NOT NULL, "pesoKg" real NOT NULL, "imc" real NOT NULL, "classificacao" varchar NOT NULL, "avaliadoEm" datetime NOT NULL DEFAULT (datetime('now')), "alunoId" varchar, "professorId" varchar)`);
        await queryRunner.query(`INSERT INTO "avaliacoes"("id", "alturaM", "pesoKg", "imc", "classificacao", "avaliadoEm", "alunoId", "professorId") SELECT "id", "alturaM", "pesoKg", "imc", "classificacao", "avaliadoEm", "alunoId", "professorId" FROM "temporary_avaliacoes"`);
        await queryRunner.query(`DROP TABLE "temporary_avaliacoes"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TABLE "avaliacoes"`);
    }

}
