import { z } from "zod";
export declare enum Cargo {
    ADMIN = "ADMIN",
    PROFESSOR = "PROFESSOR",
    ALUNO = "ALUNO"
}
export declare const CargoSchema: z.ZodNativeEnum<typeof Cargo>;
export declare const UsuarioCriarSchema: z.ZodObject<{
    nome: z.ZodString;
    email: z.ZodString;
    senha: z.ZodString;
    cargo: z.ZodNativeEnum<typeof Cargo>;
}, "strip", z.ZodTypeAny, {
    nome: string;
    email: string;
    senha: string;
    cargo: Cargo;
}, {
    nome: string;
    email: string;
    senha: string;
    cargo: Cargo;
}>;
