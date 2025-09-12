// apps/web/src/lib/api.ts
import { api, getData } from "./http";

export type Cargo = "ADMIN" | "PROFESSOR" | "ALUNO";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  cargo: Cargo;
  ativo: boolean;
};

export type Avaliacao = {
  id: string;
  aluno?: Usuario | null;
  professor?: Usuario | null;
  alturaM: number;
  pesoKg: number;
  imc: number;
  classificacao: string;
  avaliadoEm: string; // ISO string
};

// ========== AUTH ==========
export async function entrar(email: string, senha: string) {
  return getData<{ token: string; usuario: Usuario }>(
    api.post("/auth/entrar", { email, senha })
  );
}

export async function buscarMe(token: string) {
  return getData<Usuario>(
    api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
  );
}

// ========== USUÁRIOS (ADMIN) ==========
export async function listarUsuarios(token: string) {
  return getData<Usuario[]>(
    api.get("/usuarios", { headers: { Authorization: `Bearer ${token}` } })
  );
}

export async function criarUsuario(
  token: string,
  dados: { nome: string; email: string; senha: string; cargo: Cargo }
) {
  return getData<Usuario>(
    api.post("/usuarios", dados, {
      headers: { Authorization: `Bearer ${token}` },
    })
  );
}

export async function atualizarUsuario(
  token: string,
  id: string,
  dados: Partial<{ nome: string; email: string; senha: string; cargo: Cargo; ativo: boolean }>
) {
  return getData<Usuario>(
    api.patch(`/usuarios/${id}`, dados, {
      headers: { Authorization: `Bearer ${token}` },
    })
  );
}

export async function deletarUsuario(token: string, id: string) {
  await getData<void>(
    api.delete(`/usuarios/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  );
}

// ========== AVALIAÇÕES ==========
export async function listarAvaliacoes(
  token: string,
  filtros?: { idAluno?: string; idProfessor?: string }
) {
  return getData<Avaliacao[]>(
    api.get("/avaliacoes", {
      headers: { Authorization: `Bearer ${token}` },
      params: filtros ?? {},
    })
  );
}

export async function criarAvaliacao(
  token: string,
  dados: { idAluno: string; alturaM: number; pesoKg: number; idProfessor?: string }
) {
  return getData<Avaliacao>(
    api.post("/avaliacoes", dados, {
      headers: { Authorization: `Bearer ${token}` },
    })
  );
}

// ----- PROFESSOR: listar somente ALUNOS (ativos) -----
export async function listarAlunos(token: string) {
  return getData<Usuario[]>(
    api.get("/usuarios/alunos", { headers: { Authorization: `Bearer ${token}` } })
  );
}

// ----- PROFESSOR: criar/editar ALUNO -----
export async function professorCriarAluno(
  token: string,
  dados: { nome: string; email: string; senha: string }
) {
  // cargo é sempre ALUNO
  return getData<Usuario>(
    api.post("/usuarios/alunos", { ...dados, cargo: "ALUNO" }, {
      headers: { Authorization: `Bearer ${token}` },
    })
  );
}

export async function professorAtualizarAluno(
  token: string,
  id: string,
  dados: Partial<{ nome: string; email: string; senha: string; ativo: boolean }>
) {
  // não permitimos cargo aqui
  const { nome, email, senha, ativo } = dados;
  return getData<Usuario>(
    api.patch(`/usuarios/alunos/${id}`, { nome, email, senha, ativo }, {
      headers: { Authorization: `Bearer ${token}` },
    })
  );
}

// --- AVALIAÇÕES: atualizar (ADMIN; PROF só as próprias) ---
export async function atualizarAvaliacao(
  token: string,
  id: string,
  dados: Partial<{ alturaM: number; pesoKg: number }>
) {
  return getData<Avaliacao>(
    api.patch(`/avaliacoes/${id}`, dados, {
      headers: { Authorization: `Bearer ${token}` },
    })
  );
}
