import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import "reflect-metadata";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import dataSource from "./data-source";
import router from "./routes";

const app = express();
app.use(cors());
app.use(express.json());

// healthcheck
app.get("/saude", (_req, res) => res.json({ ok: true }));

// rotas da API
app.use(router);

// handler de erros
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Zod
  if (err?.issues) {
    return res.status(400).json(err);
  }
  console.error(err);
  return res.status(err?.statusCode ?? 500).json({ mensagem: err?.message ?? "Erro interno" });
});

const porta = Number(process.env.PORTA ?? 4000);
dataSource
  .initialize()
  .then(() => app.listen(porta, () => console.log(`API em http://localhost:${porta}`)))
  .catch((err) => {
    console.error("Erro ao inicializar DataSource:", err);
    process.exit(1);
  });

export default app;
