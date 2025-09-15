import { Router } from "express";
import { autenticar, exigirCargo } from "../middlewares/autenticacao";
import { validar } from "../middlewares/validar";
import {
  listarAvaliacoes,
  criarAvaliacao,
  atualizarAvaliacao,           
  validarCriarAvaliacao,
  validarAtualizarAvaliacao,    
} from "../controllers/avaliacoes.controller";
import { Cargo } from "@imc/shared";

const r = Router();

r.get("/", autenticar, listarAvaliacoes);
r.post("/", autenticar, validar(validarCriarAvaliacao), criarAvaliacao);

// ADMIN ou PROF podem editar; PROF só a própria
r.patch(
  "/:id",
  autenticar,
  exigirCargo(Cargo.ADMIN, Cargo.PROFESSOR),
  validar(validarAtualizarAvaliacao),
  atualizarAvaliacao
);

export default r;
