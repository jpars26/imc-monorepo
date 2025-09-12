"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { Box, Button, Flex, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { useAutenticacao } from "../../contexts/AutenticacaoContexto";
import { Guard } from "../../components/Guard";
import { BotaoVoltar } from "../../components/BotaoVoltar";
import {
  Usuario,
  listarAlunos,
  professorCriarAluno,
  professorAtualizarAluno,
} from "../../lib/api";

function Conteudo() {
  const { token, sair } = useAutenticacao();
  const [lista, setLista] = useState<Usuario[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setLoading(true);
        setLista(await listarAlunos(token));
      } catch (e: any) {
        setErro(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function onCriar() {
    if (!token) return;
    setErro(null);
    setLoading(true);
    try {
      const novo = await professorCriarAluno(token, { nome, email, senha });
      setLista((ant) => [novo, ...ant]);
      setNome(""); setEmail(""); setSenha("");
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function onToggle(u: Usuario) {
    if (!token) return;
    setErro(null);
    try {
      const upd = await professorAtualizarAluno(token, u.id, { ativo: !u.ativo });
      setLista((ant) => ant.map((x) => (x.id === u.id ? upd : x)));
    } catch (e: any) {
      setErro(e.message);
    }
  }

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Alunos</Heading>
        <Stack direction="row">
          <BotaoVoltar />
          <Button variant="outline" onClick={sair}>Sair</Button>
        </Stack>
      </Flex>

      <Stack direction={{ base: "column", md: "row" }} gap={3} mb={4}>
        <Input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Input placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <Button onClick={onCriar} loading={loading}>Criar</Button>
      </Stack>

      {erro && <Text color="red.500" mb={3}>{erro}</Text>}

      {loading ? <Text>Carregando...</Text> : (
        <Stack gap={2}>
          {lista.map((u) => (
            <Flex key={u.id} p={3} border="1px solid #eee" borderRadius="md" align="center" justify="space-between">
              <Box>
                <Text><b>{u.nome}</b> — {u.email}</Text>
                <Text fontSize="sm" color="gray.600">Status: {u.ativo ? "Ativo" : "Inativo"}</Text>
              </Box>
              <Stack direction="row">
                <Button size="sm" onClick={() => onToggle(u)}>
                  {u.ativo ? "Desativar" : "Ativar"}
                </Button>
              </Stack>
            </Flex>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default function Page() {
  // restringe a PROFESSOR
  return (
    <Guard cargos={["PROFESSOR"] as any}>
      <Conteudo />
    </Guard>
  );
}
