// apps/api/src/routes/usuarios.routes.ts
import { Router } from "express";
import { autenticar, exigirCargo } from "../middlewares/autenticacao";
import { validar } from "../middlewares/validar";
import {
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario,
  validarCriarUsuario,
  validarAtualizarUsuario,
  listarAlunosParaProfessor,
} from "../controllers/usuarios.controller";
import { Cargo } from "@imc/shared";

const r = Router();

/** ADMIN → acesso pleno */
r.get("/", autenticar, exigirCargo(Cargo.ADMIN), listarUsuarios);
r.post("/", autenticar, exigirCargo(Cargo.ADMIN), validar(validarCriarUsuario), criarUsuario);
r.patch("/:id", autenticar, exigirCargo(Cargo.ADMIN), validar(validarAtualizarUsuario), atualizarUsuario);
r.delete("/:id", autenticar, exigirCargo(Cargo.ADMIN), deletarUsuario);

/** PROFESSOR → pode GERENCIAR SOMENTE ALUNO */
r.get("/alunos", autenticar, exigirCargo(Cargo.PROFESSOR), listarAlunosParaProfessor);

r.post(
  "/alunos",
  autenticar,
  exigirCargo(Cargo.PROFESSOR),
  validar(validarCriarUsuario),
  (req, res, next) => {
    // apenas alunos
    if (req.body?.cargo !== "ALUNO") {
      return res.status(403).json({ mensagem: "Professor só pode criar ALUNO" });
    }
    (req as any)._somenteAluno = true; // flag lida no controller
    return criarUsuario(req, res).catch(next);
  }
);

r.patch(
  "/alunos/:id",
  autenticar,
  exigirCargo(Cargo.PROFESSOR),
  validar(validarAtualizarUsuario),
  (req, res, next) => {
    (req as any)._somenteAluno = true; // só edita ALUNO
    return atualizarUsuario(req, res).catch(next);
  }
);

export default r;
