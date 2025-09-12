import { Router } from "express";
import auth from "./auth.routes";
import usuarios from "./usuarios.routes";
import avaliacoes from "./avaliacoes.routes";

const router = Router();
router.use("/auth", auth);
router.use("/usuarios", usuarios);
router.use("/avaliacoes", avaliacoes);

export default router;
