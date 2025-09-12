import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CargoSchema } from "@imc/shared";
import { z } from "zod";

const UsuarioCriarSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
  cargo: CargoSchema, // pode ser z.nativeEnum(Cargo)
});

export function autenticar(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return res.status(401).json({ mensagem: "Não autorizado" });

  const token = h.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRETO!) as { sub: string; cargo: Cargo; ativo: boolean };
    if (!payload.ativo) return res.status(403).json({ mensagem: "Usuário inativo" });
    req.usuario = payload;
    next();
  } catch {
    return res.status(401).json({ mensagem: "Token inválido" });
  }
}

export function exigirCargo(...cargos: Cargo[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario || !cargos.includes(req.usuario.cargo)) {
      return res.status(403).json({ mensagem: "Proibido" });
    }
    next();
  };
}
