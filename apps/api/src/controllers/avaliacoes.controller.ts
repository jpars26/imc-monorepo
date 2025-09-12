// apps/api/src/controllers/avaliacoes.controller.ts
import { z } from "zod";
import type { Request, Response } from "express";
import dataSource from "../data-source";
import { Usuario } from "../entidades/Usuario";
import { Avaliacao } from "../entidades/Avaliacao";
import { calcularIMC, classificarIMC } from "../dominio/imc";
import { Cargo } from "@imc/shared";

// helper: converte "1,70" -> "1.70"
const numeroPt = (max: number) =>
  z.preprocess((v) => (typeof v === "string" ? v.replace(",", ".") : v),
    z.coerce.number().positive().max(max)
  );

/** Schemas */
const AvaliacaoQuerySchema = z.object({
  idAluno: z.string().uuid().optional(),
  idProfessor: z.string().uuid().optional(),
});

const AvaliacaoCriarSchema = z.object({
  idAluno: z.string().uuid(),
  alturaM: numeroPt(3),
  pesoKg: numeroPt(400),
  idProfessor: z.string().uuid().optional(),
});

const AvaliacaoAtualizarSchema = z.object({
  alturaM: numeroPt(3).optional(),
  pesoKg: numeroPt(400).optional(),
});

export const validarCriarAvaliacao = AvaliacaoCriarSchema;
export const validarAtualizarAvaliacao = AvaliacaoAtualizarSchema;

/** GET /avaliacoes (com filtros) */
export async function listarAvaliacoes(req: Request, res: Response) {
  const parsed = AvaliacaoQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) return res.status(400).json(parsed.error.format());
  const { idAluno, idProfessor } = parsed.data;

  const repo = dataSource.getRepository(Avaliacao);
  const qb = repo
    .createQueryBuilder("a")
    .leftJoinAndSelect("a.aluno", "aluno")
    .leftJoinAndSelect("a.professor", "professor");

  if (idAluno) qb.andWhere("aluno.id = :idAluno", { idAluno });
  if (idProfessor) qb.andWhere("professor.id = :idProfessor", { idProfessor });

  // Restrições por cargo
  if (req.usuario?.cargo === Cargo.ALUNO) qb.andWhere("aluno.id = :eu", { eu: req.usuario.sub });
  if (req.usuario?.cargo === Cargo.PROFESSOR) qb.andWhere("professor.id = :eu", { eu: req.usuario.sub });

  const dados = await qb.orderBy("a.avaliadoEm", "DESC").getMany();
  res.json(dados);
}

/** POST /avaliacoes (ADMIN ou PROFESSOR) */
export async function criarAvaliacao(req: Request, res: Response) {
  if (!req.usuario || ![Cargo.ADMIN, Cargo.PROFESSOR].includes(req.usuario.cargo)) {
    return res.status(403).json({ mensagem: "Proibido" });
  }

  const parsed = AvaliacaoCriarSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());
  const { idAluno, alturaM, pesoKg, idProfessor } = parsed.data;

  const usuarioRepo = dataSource.getRepository(Usuario);
  const avaliacaoRepo = dataSource.getRepository(Avaliacao);

  const aluno = await usuarioRepo.findOneBy({ id: idAluno });
  if (!aluno || aluno.cargo !== Cargo.ALUNO || !aluno.ativo) {
    return res.status(400).json({ mensagem: "Aluno inválido/inativo" });
  }

  const idProf = req.usuario.cargo === Cargo.PROFESSOR ? req.usuario.sub : idProfessor ?? req.usuario.sub;
  const professor = await usuarioRepo.findOneBy({ id: idProf });
  if (!professor || professor.cargo !== Cargo.PROFESSOR || !professor.ativo) {
    return res.status(400).json({ mensagem: "Professor inválido/inativo" });
  }

  const imc = calcularIMC(alturaM, pesoKg);
  const classificacao = classificarIMC(imc);

  const nova = avaliacaoRepo.create({ aluno, professor, alturaM, pesoKg, imc, classificacao });
  await avaliacaoRepo.save(nova);
  res.status(201).json(nova);
}

/** PATCH /avaliacoes/:id (ADMIN ou PROFESSOR dono) */
export async function atualizarAvaliacao(req: Request, res: Response) {
  if (!req.usuario || ![Cargo.ADMIN, Cargo.PROFESSOR].includes(req.usuario.cargo)) {
    return res.status(403).json({ mensagem: "Proibido" });
  }

  const parsed = AvaliacaoAtualizarSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());
  const { alturaM, pesoKg } = parsed.data;

  const repo = dataSource.getRepository(Avaliacao);
  const a = await repo.findOne({
    where: { id: req.params.id },
    relations: { aluno: true, professor: true },
  });
  if (!a) return res.status(404).json({ mensagem: "Avaliação não encontrada" });

  // Professor só pode editar a avaliação que ele mesmo cadastrou
  if (req.usuario.cargo === Cargo.PROFESSOR && a.professor.id !== req.usuario.sub) {
    return res.status(403).json({ mensagem: "Proibido" });
  }

  let recalcular = false;
  if (alturaM != null) { a.alturaM = alturaM; recalcular = true; }
  if (pesoKg != null)  { a.pesoKg  = pesoKg;  recalcular = true; }

  if (recalcular) {
    a.imc = calcularIMC(a.alturaM, a.pesoKg);
    a.classificacao = classificarIMC(a.imc);
  }

  await repo.save(a);
  res.json(a);
}

/** DELETE /avaliacoes/:id (ADMIN ou PROFESSOR dono) */
export async function deletarAvaliacao(req: Request, res: Response) {
  if (!req.usuario || ![Cargo.ADMIN, Cargo.PROFESSOR].includes(req.usuario.cargo)) {
    return res.status(403).json({ mensagem: "Proibido" });
  }

  const repo = dataSource.getRepository(Avaliacao);
  const a = await repo.findOne({
    where: { id: req.params.id },
    relations: { professor: true },
  });
  if (!a) return res.status(404).json({ mensagem: "Avaliação não encontrada" });

  if (req.usuario.cargo === Cargo.PROFESSOR && a.professor.id !== req.usuario.sub) {
    return res.status(403).json({ mensagem: "Proibido" });
  }

  await repo.delete(a.id);
  return res.status(204).send();
}
