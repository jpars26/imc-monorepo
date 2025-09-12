// packages/shared/src/index.ts
import { z } from "zod";

export enum Cargo {
  ADMIN = "ADMIN",
  PROFESSOR = "PROFESSOR",
  ALUNO = "ALUNO"
}

export const CargoSchema = z.nativeEnum(Cargo);

// Exporte outros schemas se quiser reutilizar em outros pacotes
export const UsuarioCriarSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
  cargo: CargoSchema,
});
