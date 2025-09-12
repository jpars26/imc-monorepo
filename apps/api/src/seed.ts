import { default as dataSource } from "./data-source";
import { Usuario } from "./entidades/Usuario";
import bcrypt from "bcryptjs";

async function main() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(Usuario);
  const email = "admin@admin.com";
  const existe = await repo.exist({ where: { email } });
  if (!existe) {
    const admin = repo.create({
      nome: "Admin",
      email,
      cargo: "ADMIN",
      senhaHash: await bcrypt.hash("admin123", 10),
      ativo: true
    });
    await repo.save(admin);
    console.log("Admin criado:", email, "senha: admin123");
  } else {
    console.log("Admin já existe:", email);
  }
  await dataSource.destroy();
}
main().catch((e) => { console.error(e); process.exit(1); });
