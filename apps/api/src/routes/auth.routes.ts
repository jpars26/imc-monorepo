import { Router } from "express";
import { autenticar } from "../middlewares/autenticacao";
import { validar } from "../middlewares/validar";
import { entrar, me, validarLogin } from "../controllers/auth.controller";

const r = Router();
r.post("/entrar", validar(validarLogin), entrar);
r.get("/me", autenticar, me);
export default r;
