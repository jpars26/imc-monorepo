// apps/web/src/app/avaliacoes/page.tsx
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
  Usuario,
  Avaliacao,
  listarUsuarios,
  listarAvaliacoes,
  criarAvaliacao,
} from "../../lib/api";
import { Guard } from "../../components/Guard";

function AvaliacoesConteudo() {
  const { token, usuario, sair } = useAutenticacao();

  const [alunos, setAlunos] = useState<Usuario[]>([]);
  const [profs, setProfs] = useState<Usuario[]>([]);
  const [lista, setLista] = useState<Avaliacao[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  // carregadores separados: lista x botão salvar
  const [carregandoLista, setCarregandoLista] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // form
  const [idAluno, setIdAluno] = useState<string>("");
  const [alturaM, setAlturaM] = useState<string>("");
  const [pesoKg, setPesoKg] = useState<string>("");
  const [idProfessor, setIdProfessor] = useState<string>("");

  const possoCriar = usuario?.cargo === "ADMIN" || usuario?.cargo === "PROFESSOR";

  // Carregar dados após estar autenticado
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setCarregandoLista(true);

        // lista de avaliações (backend já restringe por cargo)
        const avals = await listarAvaliacoes(token);
        setLista(avals);

        // opções para o formulário
        if (possoCriar) {
          const todos = await listarUsuarios(token);
          setAlunos(todos.filter((u) => u.cargo === "ALUNO" && u.ativo));
          setProfs(todos.filter((u) => u.cargo === "PROFESSOR" && u.ativo));
          if (usuario?.cargo === "PROFESSOR") setIdProfessor(usuario.id);
        }
      } catch (e: any) {
        setErro(e.message);
      } finally {
        setCarregandoLista(false);
      }
    })();
  }, [token, possoCriar, usuario]);

  async function onCriar() {
    setErro(null);
    try {
      if (!token) return;

      if (!idAluno || !alturaM || !pesoKg) {
        setErro("Preencha aluno, altura e peso.");
        return;
      }

      setSalvando(true);

      const dados: any = {
        idAluno,
        alturaM: Number(alturaM),
        pesoKg: Number(pesoKg),
      };
      // Admin pode escolher professor; professor logado usa o próprio (backend já assume isso)
      if (usuario?.cargo === "ADMIN" && idProfessor) dados.idProfessor = idProfessor;

      const nova = await criarAvaliacao(token, dados);
      setLista((ant) => [nova, ...ant]);
      setIdAluno("");
      setAlturaM("");
      setPesoKg("");
      if (usuario?.cargo === "ADMIN") setIdProfessor("");
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  const resumo = useMemo(() => {
    const q = lista.length;
    const mediaIMC = q ? (lista.reduce((s, a) => s + a.imc, 0) / q).toFixed(1) : "0.0";
    return { q, mediaIMC };
  }, [lista]);

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Avaliações</Heading>
        <Button variant="outline" onClick={sair}>Sair</Button>
      </Flex>

      <Box bg="gray.50" p={4} borderRadius="md" mb={6}>
        <Text>
          <b>Total:</b> {resumo.q} · <b>IMC médio:</b> {resumo.mediaIMC}
        </Text>
      </Box>

      {possoCriar && (
        <>
          <Heading size="md" mb={2}>Nova avaliação</Heading>
          <Stack direction={{ base: "column", md: "row" }} gap={3} mb={4}>
            <NativeSelect.Root size="sm" width="260px">
              <NativeSelect.Field
                placeholder="Selecione o aluno"
                value={idAluno}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setIdAluno(e.currentTarget.value)
                }
              >
                <option value="" disabled hidden>Selecione o aluno</option>
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome} ({a.email})
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>

            <Input
              placeholder="Altura (m)"
              value={alturaM}
              onChange={(e) => setAlturaM(e.target.value)}
            />
            <Input
              placeholder="Peso (kg)"
              value={pesoKg}
              onChange={(e) => setPesoKg(e.target.value)}
            />

            {usuario?.cargo === "ADMIN" && (
              <NativeSelect.Root size="sm" width="220px">
                <NativeSelect.Field
                  placeholder="Professor (opcional)"
                  value={idProfessor}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setIdProfessor(e.currentTarget.value)
                  }
                >
                  <option value="">Professor (opcional)</option>
                  {profs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            )}

            {/* Chakra v3: prop é `loading` */}
            <Button onClick={onCriar} loading={salvando}>Salvar</Button>
          </Stack>
        </>
      )}

      {erro && <Text color="red.500" mb={3}>{erro}</Text>}

      <Stack gap={2}>
        {carregandoLista ? (
          <Text>Carregando...</Text>
        ) : (
          lista.map((a) => (
            <Box key={a.id} p={3} border="1px solid #eee" borderRadius="md">
              <Text>
                <b>Aluno:</b> {a.aluno?.nome} · <b>Professor:</b> {a.professor?.nome}
              </Text>
              <Text>
                <b>Altura:</b> {a.alturaM} m · <b>Peso:</b> {a.pesoKg} kg
              </Text>
              <Text>
                <b>IMC:</b> {a.imc} · <b>Classificação:</b> {a.classificacao}
              </Text>
              <Text color="gray.600" fontSize="sm">
                {new Date(a.avaliadoEm).toLocaleString()}
              </Text>
            </Box>
          ))
        )}
      </Stack>
    </Box>
  );
}

export default function AvaliacoesPage() {
  // qualquer usuário autenticado pode acessar; o backend restringe os dados por cargo
  return (
    <Guard>
      <AvaliacoesConteudo />
    </Guard>
  );
}
