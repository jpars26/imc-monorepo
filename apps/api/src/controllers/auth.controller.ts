import { z } from "zod";
import type { Request, Response } from "express";
import dataSource from "../data-source";
import { Usuario } from "../entidades/Usuario";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const LoginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6),
});

export const validarLogin = LoginSchema;

export async function entrar(req: Request, res: Response) {
  const { email, senha } = req.body as z.infer<typeof LoginSchema>;

  const repo = dataSource.getRepository(Usuario);
  const usuario = await repo.findOneBy({ email });
  if (!usuario) return res.status(401).json({ mensagem: "Credenciais inválidas" });

  const ok = await bcrypt.compare(senha, usuario.senhaHash);
  if (!ok) return res.status(401).json({ mensagem: "Credenciais inválidas" });

  const segredo = process.env.JWT_SECRETO;
  if (!segredo) return res.status(500).json({ mensagem: "Configuração JWT ausente" });

  const token = jwt.sign({ sub: usuario.id, cargo: usuario.cargo, ativo: usuario.ativo }, segredo, { expiresIn: "8h" });

  res.json({
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, cargo: usuario.cargo, ativo: usuario.ativo },
  });
}

export async function me(req: Request, res: Response) {
  const repo = dataSource.getRepository(Usuario);
  const user = await repo.findOneBy({ id: req.usuario!.sub });
  if (!user) return res.status(404).json({ mensagem: "Usuário não encontrado" });
  res.json({ id: user.id, nome: user.nome, email: user.email, cargo: user.cargo, ativo: user.ativo });
}
