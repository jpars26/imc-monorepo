import { z } from "zod";
export declare const CargoEnum: z.ZodEnum<["ADMIN", "PROFESSOR", "ALUNO"]>;
export declare const AutenticarLoginSchema: z.ZodObject<{
    email: z.ZodString;
    senha: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    senha: string;
}, {
    email: string;
    senha: string;
}>;
