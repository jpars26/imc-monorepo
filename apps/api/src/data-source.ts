import "dotenv/config";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Usuario } from "./entidades/Usuario";
import { Avaliacao } from "./entidades/Avaliacao";
import * as path from "node:path";

const dataSource = new DataSource({
  type: "sqlite",
  database: process.env.DB_PATH || path.join(process.cwd(), "imc.sqlite"),
  entities: [Usuario, Avaliacao],
  migrations: ["src/migracoes/*.ts"],
  logging: false
});

export default dataSource;
