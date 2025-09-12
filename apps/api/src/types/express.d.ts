import type { Cargo } from "@imc/shared";

declare global {
  namespace Express {
    interface Request {
      usuario?: { sub: string; cargo: Cargo; ativo: boolean };
      _somenteAluno?: boolean; // 👈 adiciona a flag aqui
    }
  }
}
export {};
