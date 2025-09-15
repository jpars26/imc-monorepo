"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutenticarLoginSchema = exports.CargoEnum = void 0;
const zod_1 = require("zod");
exports.CargoEnum = zod_1.z.enum(["ADMIN", "PROFESSOR", "ALUNO"]);
exports.AutenticarLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    senha: zod_1.z.string().min(6)
});
