"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioCriarSchema = exports.CargoSchema = exports.Cargo = void 0;
// packages/shared/src/index.ts
const zod_1 = require("zod");
var Cargo;
(function (Cargo) {
    Cargo["ADMIN"] = "ADMIN";
    Cargo["PROFESSOR"] = "PROFESSOR";
    Cargo["ALUNO"] = "ALUNO";
})(Cargo || (exports.Cargo = Cargo = {}));
exports.CargoSchema = zod_1.z.nativeEnum(Cargo);


exports.UsuarioCriarSchema = zod_1.z.object({
    nome: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    senha: zod_1.z.string().min(6),
    cargo: exports.CargoSchema,
});
