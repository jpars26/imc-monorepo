// apps/api/src/controllers/usuarios.controller.ts
import { z } from "zod";
import type { Request, Response } from "express";
import dataSource from "../data-source";
import { Usuario } from "../entidades/Usuario";
import { Avaliacao } from "../entidades/Avaliacao";
import bcrypt from "bcryptjs";
import { Cargo, CargoSchema as SharedCargoSchema } from "@imc/shared";
import type { DeepPartial } from "typeorm";

// Blindagem: se o shared não exportar por algum motivo, usa-se um local
const CargoSchema = SharedCargoSchema ?? z.enum(["ADMIN", "PROFESSOR", "ALUNO"]);

const UsuarioCriarSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
  cargo: CargoSchema,
});

const UsuarioAtualizarSchema = z.object({
  nome: z.string().min(2).optional(),
  email: z.string().email().optional(),
  senha: z.string().min(6).optional(),
  cargo: CargoSchema.optional(),
  ativo: z.boolean().optional(),
});

export const validarCriarUsuario = UsuarioCriarSchema;
export const validarAtualizarUsuario = UsuarioAtualizarSchema;

export async function listarUsuarios(_req: Request, res: Response) {
  const usuarios = await dataSource.getRepository(Usuario).find();
  res.json(usuarios);
}

export async function criarUsuario(req: Request, res: Response) {
  const { nome, email, senha, cargo } = req.body as z.infer<typeof UsuarioCriarSchema>;
  const repo = dataSource.getRepository(Usuario);

  // 🔒 Se a rota marcou _somenteAluno (professor), só pode criar ALUNO
  if ((req as any)._somenteAluno && cargo !== "ALUNO") {
    return res.status(403).json({ mensagem: "Professor só pode criar usuários do tipo ALUNO" });
  }

  const emailNorm = email.toLowerCase().trim();
  const existe = await repo.exist({ where: { email: emailNorm } });
  if (existe) return res.status(400).json({ mensagem: "E-mail já utilizado" });

  const dadosNovo: DeepPartial<Usuario> = {
    nome,
    email: emailNorm,
    cargo: cargo as Cargo, // entidade tipada com enum Cargo
    senhaHash: await bcrypt.hash(senha, 10),
    ativo: true,
  };

  const novo = repo.create(dadosNovo);
  await repo.save(novo);
  res.status(201).json(novo);
}

export async function atualizarUsuario(req: Request, res: Response) {
  const repo = dataSource.getRepository(Usuario);
  const usuario = await repo.findOneBy({ id: req.params.id });
  if (!usuario) return res.status(404).json({ mensagem: "Usuário não encontrado" });

  const dados = req.body as z.infer<typeof UsuarioAtualizarSchema>;

  // 🔒 Se a rota marcou _somenteAluno (professor),
  //    só pode editar ALUNO e não pode trocar cargo para não-ALUNO.
  if ((req as any)._somenteAluno) {
    if (usuario.cargo !== "ALUNO") {
      return res.status(403).json({ mensagem: "Professor só edita usuários ALUNO" });
    }
    if (dados.cargo && dados.cargo !== "ALUNO") {
      return res.status(403).json({ mensagem: "Professor não pode alterar cargo para não-ALUNO" });
    }
  }

  if (dados.senha) usuario.senhaHash = await bcrypt.hash(dados.senha, 10);
  if (dados.nome) usuario.nome = dados.nome;
  if (dados.email) usuario.email = dados.email.toLowerCase().trim();
  if (dados.cargo) usuario.cargo = dados.cargo as Cargo;
  if (typeof dados.ativo === "boolean") usuario.ativo = dados.ativo;

  await repo.save(usuario);
  res.json(usuario);
}

export async function deletarUsuario(req: Request, res: Response) {
  const usuarioRepo = dataSource.getRepository(Usuario);
  const avaliacaoRepo = dataSource.getRepository(Avaliacao);

  const usuario = await usuarioRepo.findOneBy({ id: req.params.id });
  if (!usuario) return res.status(404).json({ mensagem: "Usuário não encontrado" });

  const temAvaliacoes = await avaliacaoRepo.exist({
    where: [{ aluno: { id: usuario.id } }, { professor: { id: usuario.id } }] as any,
  });
  if (temAvaliacoes) return res.status(400).json({ mensagem: "Não é possível excluir: há avaliações vinculadas" });

  await usuarioRepo.delete(usuario.id);
  return res.status(204).send();
}
