// apps/api/src/routes/avaliacoes.routes.ts
import { Router } from "express";
import { autenticar } from "../middlewares/autenticacao";
import { validar } from "../middlewares/validar";
import { listarAvaliacoes, criarAvaliacao, validarCriarAvaliacao, atualizarAvaliacao, deletarAvaliacao } from "../controllers/avaliacoes.controller";

const r = Router();
r.get("/", autenticar, listarAvaliacoes);
r.post("/", autenticar, validar(validarCriarAvaliacao), criarAvaliacao);
r.patch("/:id", autenticar, atualizarAvaliacao);
r.delete("/:id", autenticar, deletarAvaliacao);
export default r;
