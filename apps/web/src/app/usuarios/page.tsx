// apps/web/src/app/usuarios/page.tsx
"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  NativeSelect,
} from "@chakra-ui/react";
import { useAutenticacao } from "../../contexts/AutenticacaoContexto";
import {
  Cargo,
  Usuario,
  criarUsuario,
  listarUsuarios,
  atualizarUsuario,
  deletarUsuario,
} from "../../lib/api";
import { Guard } from "../../components/Guard";
import { BotaoVoltar } from "../../components/BotaoVoltar";

const cargos: Cargo[] = ["ADMIN", "PROFESSOR", "ALUNO"];

function UsuariosConteudo() {
  const { token, usuario, sair } = useAutenticacao();

  const [lista, setLista] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);

  // form simples
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cargo, setCargo] = useState<Cargo>("ALUNO");
  const [erro, setErro] = useState<string | null>(null);

  // carrega a lista após hidratar e com ADMIN autenticado
  useEffect(() => {
    if (!token || usuario?.cargo !== "ADMIN") return;
    (async () => {
      try {
        setLoading(true);
        const dados = await listarUsuarios(token);
        setLista(dados);
      } catch (e: any) {
        setErro(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, usuario]);

  async function onCriar() {
    setErro(null);
    try {
      if (!token) return;
      const novo = await criarUsuario(token, { nome, email, senha, cargo });
      setLista((ant) => [novo, ...ant]);
      setNome(""); setEmail(""); setSenha(""); setCargo("ALUNO");
    } catch (e: any) {
      setErro(e.message);
    }
  }

  async function onToggleAtivo(u: Usuario) {
    try {
      if (!token) return;
      const upd = await atualizarUsuario(token, u.id, { ativo: !u.ativo });
      setLista((ant) => ant.map((x) => (x.id === u.id ? upd : x)));
    } catch (e: any) {
      setErro(e.message);
    }
  }

  async function onDelete(u: Usuario) {
    if (!confirm(`Excluir ${u.nome}?`)) return;
    try {
      if (!token) return;
      await deletarUsuario(token, u.id);
      setLista((ant) => ant.filter((x) => x.id !== u.id));
    } catch (e: any) {
      setErro(e.message);
    }
  }

  const total = useMemo(
    () => ({
      admins: lista.filter((x) => x.cargo === "ADMIN").length,
      profs:  lista.filter((x) => x.cargo === "PROFESSOR").length,
      alunos: lista.filter((x) => x.cargo === "ALUNO").length,
    }),
    [lista]
  );

  // como o Guard garante ADMIN autenticado, não precisamos checar token/cargo aqui
  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Usuários</Heading>
        <BotaoVoltar />
        <Button variant="outline" onClick={sair}>Sair</Button>
      </Flex>

      <Box bg="gray.50" p={4} borderRadius="md" mb={6}>
        <Text>
          <b>Totais:</b> Admins {total.admins} · Professores {total.profs} · Alunos {total.alunos}
        </Text>
      </Box>

      <Stack direction={{ base: "column", md: "row" }} gap={3} mb={4}>
        <Input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Input placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />

        {/* Chakra v3: NativeSelect (em vez de Select direto) */}
        <NativeSelect.Root size={{ base: "md", md: "sm" }}
              w={{ base: "100%", md: "260px", lg: "500px" }}>
          <NativeSelect.Field
            value={cargo}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setCargo(e.currentTarget.value as Cargo)
            }
          >
            {cargos.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>

        {/* Chakra v3: prop é `loading` */}
        <Button onClick={onCriar} loading={loading}>Criar</Button>
      </Stack>

      {erro && <Text color="red.500" mb={3}>{erro}</Text>}

      <Stack gap={2}>
        {lista.map((u) => (
          <Flex
            key={u.id}
            p={3}
            border="1px solid #eee"
            borderRadius="md"
            align="center"
            justify="space-between"
          >
            <Box>
              <Text><b>{u.nome}</b> — {u.email}</Text>
              <Text fontSize="sm" color="gray.600">
                Cargo: {u.cargo} · {u.ativo ? "Ativo" : "Inativo"}
              </Text>
            </Box>
            <Stack direction="row">
              <Button size="sm" onClick={() => onToggleAtivo(u)}>
                {u.ativo ? "Desativar" : "Ativar"}
              </Button>
              <Button size="sm" variant="outline" colorPalette="red" onClick={() => onDelete(u)}>
                Excluir
              </Button>
            </Stack>
          </Flex>
        ))}
      </Stack>
    </Box>
  );
}

// export padrão com Guard exigindo ADMIN
export default function UsuariosPage() {
  return (
    <Guard precisaAdmin>
      <UsuariosConteudo />
    </Guard>
  );
}
