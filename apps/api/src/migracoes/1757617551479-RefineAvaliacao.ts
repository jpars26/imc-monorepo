import { MigrationInterface, QueryRunner } from "typeorm";

export class RefineAvaliacao1757617551479 implements MigrationInterface {
    name = 'RefineAvaliacao1757617551479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_avaliacoes" ("id" varchar PRIMARY KEY NOT NULL, "alturaM" real NOT NULL, "pesoKg" real NOT NULL, "imc" real NOT NULL, "classificacao" varchar NOT NULL, "avaliadoEm" datetime NOT NULL DEFAULT (datetime('now')), "alunoId" varchar, "professorId" varchar)`);
        await queryRunner.query(`INSERT INTO "temporary_avaliacoes"("id", "alturaM", "pesoKg", "imc", "classificacao", "avaliadoEm", "alunoId", "professorId") SELECT "id", "alturaM", "pesoKg", "imc", "classificacao", "avaliadoEm", "alunoId", "professorId" FROM "avaliacoes"`);
        await queryRunner.query(`DROP TABLE "avaliacoes"`);
        await queryRunner.query(`ALTER TABLE "temporary_avaliacoes" RENAME TO "avaliacoes"`);
        await queryRunner.query(`CREATE TABLE "temporary_avaliacoes" ("id" varchar PRIMARY KEY NOT NULL, "alturaM" real NOT NULL, "pesoKg" real NOT NULL, "imc" real NOT NULL, "classificacao" text NOT NULL, "avaliadoEm" datetime NOT NULL DEFAULT (datetime('now')), "alunoId" varchar NOT NULL, "professorId" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_avaliacoes"("id", "alturaM", "pesoKg", "imc", "classificacao", "avaliadoEm", "alunoId", "professorId") SELECT "id", "alturaM", "pesoKg", "imc", "classificacao", "avaliadoEm", "alunoId", "professorId" FROM "avaliacoes"`);
        await queryRunner.query(`DROP TABLE "avaliacoes"`);
        await queryRunner.query(`ALTER TABLE "temporary_avaliacoes" RENAME TO "avaliacoes"`);
        await queryRunner.query(`CREATE INDEX "IDX_avaliacoes_aluno" ON "avaliacoes" ("alunoId") `);
        await queryRunner.query(`CREATE INDEX "IDX_avaliacoes_professor" ON "avaliacoes" ("professorId") `);
        await queryRunner.query(`DROP INDEX "IDX_avaliacoes_aluno"`);
        await queryRunner.query(`DROP INDEX "IDX_avaliacoes_professor"`);
        await queryRunner.query(`CREATE TABLE "temporary_avaliacoes" ("id" varchar PRIMARY KEY NOT NULL, "alturaM" real NOT NULL, "pesoKg" real NOT NULL, "imc" real NOT NULL, "classificacao" text NOT NULL, "avaliadoEm" datetime NOT NULL DEFAULT (datetime('now')), "alunoId" varchar NOT NULL, "professorId" varchar NOT NULL, CONSTRAINT "FK_3605d3b7283e830d6296effdc33" FOREIGN KEY ("alunoId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION, CONSTRAINT "FK_f09ee12fa4a31c579a07d2e161e" FOREIGN KEY ("professorId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_avaliacoes"("id", "alturaM", "pesoKg", "imc", "classificacao", "avaliadoEm", "alunoId", "professorId") SELECT "id", "alturaM", "pesoKg", "imc", "classificacao", "avaliadoEm", "alunoId", "professorId" FROM "avaliacoes"`);
        await queryRunner.query(`DROP TABLE "avaliacoes"`);
        await queryRunner.query(`ALTER TABLE "temporary_avaliacoes" RENAME TO "avaliacoes"`);
        await queryRunner.query(`CREATE INDEX "IDX_avaliacoes_aluno" ON "avaliacoes" ("alunoId") `);
        await queryRunner.query(`CREATE INDEX "IDX_avaliacoes_professor" ON "avaliacoes" ("professorId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_avaliacoes_professor"`);
        await queryRunner.query(`DROP INDEX "IDX_avaliacoes_aluno"`);
        await queryRunner.query(`ALTER TABLE "avaliacoes" RENAME TO "temporary_avaliacoes"`);
        await queryRunner.query(`CREATE TABLE "avaliacoes" ("id" varchar PRIMARY KEY NOT NULL, "alturaM" real NOT NULL, "pesoKg" real NOT NULL, "imc" real NOT NULL, "classificacao" text NOT NULL, "avaliadoEm" datetime NOT NULL DEFAULT (datetime('now')), "alunoId" varchar NOT NULL, "professorId" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "avaliacoes"("id", "alturaM", "pesoKg", "imc", "classificacao", "avaliadoEm", "alunoId", "professorId") SELECT "id", "alturaM", "pesoKg", "imc", "classificacao", "avaliadoEm", "alunoId", "professorId" FROM "temporary_avaliacoes"`);
        await queryRunner.query(`DROP TABLE "temporary_avaliacoes"`);
        await queryRunner.query(`CREATE INDEX "IDX_avaliacoes_professor" ON "avaliacoes" ("professorId") `);
        await queryRunner.query(`CREATE INDEX "IDX_avaliacoes_aluno" ON "avaliacoes" ("alunoId") `);
        await queryRunner.query(`DROP INDEX "IDX_avaliacoes_professor"`);
        await queryRunner.query(`DROP INDEX "IDX_avaliacoes_aluno"`);
        await queryRunner.query(`ALTER TABLE "avaliacoes" RENAME TO "temporary_avaliacoes"`);
        await queryRunner.query(`CREATE TABLE "avaliacoes" ("id" varchar PRIMARY KEY NOT NULL, "alturaM" real NOT NULL, "pesoKg" real NOT NULL, "imc" real NOT NULL, "classificacao" varchar NOT NULL, "avaliadoEm" datetime NOT NULL DEFAULT (datetime('now')), "alunoId" varchar, "professorId" varchar)`);
        await queryRunner.query(`INSERT INTO "avaliacoes"("id", "alturaM", "pesoKg", "imc", "classificacao", "avaliadoEm", "alunoId", "professorId") SELECT "id", "alturaM", "pesoKg", "imc", "classificacao", "avaliadoEm", "alunoId", "professorId" FROM "temporary_avaliacoes"`);
        await queryRunner.query(`DROP TABLE "temporary_avaliacoes"`);
        await queryRunner.query(`ALTER TABLE "avaliacoes" RENAME TO "temporary_avaliacoes"`);
        await queryRunner.query(`CREATE TABLE "avaliacoes" ("id" varchar PRIMARY KEY NOT NULL, "alturaM" real NOT NULL, "pesoKg" real NOT NULL, "imc" real NOT NULL, "classificacao" varchar NOT NULL, "avaliadoEm" datetime NOT NULL DEFAULT (datetime('now')), "alunoId" varchar, "professorId" varchar, CONSTRAINT "FK_3605d3b7283e830d6296effdc33" FOREIGN KEY ("alunoId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "avaliacoes"("id", "alturaM", "pesoKg", "imc", "classificacao", "avaliadoEm", "alunoId", "professorId") SELECT "id", "alturaM", "pesoKg", "imc", "classificacao", "avaliadoEm", "alunoId", "professorId" FROM "temporary_avaliacoes"`);
        await queryRunner.query(`DROP TABLE "temporary_avaliacoes"`);
    }

}
