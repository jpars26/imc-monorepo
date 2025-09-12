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
  listarUsuarios,     // ADMIN
  listarAlunos,       // PROFESSOR
  listarAvaliacoes,
  criarAvaliacao,
  atualizarAvaliacao, // 👈 novo
} from "../../lib/api";
import { Guard } from "../../components/Guard";
import { BotaoVoltar } from "../../components/BotaoVoltar";

function AvaliacoesConteudo() {
  const { token, usuario, sair } = useAutenticacao();

  const [alunos, setAlunos] = useState<Usuario[]>([]);
  const [profs, setProfs] = useState<Usuario[]>([]);
  const [lista, setLista] = useState<Avaliacao[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const [carregandoLista, setCarregandoLista] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // edição inline
  const [editId, setEditId] = useState<string | null>(null);
  const [editAltura, setEditAltura] = useState<string>("");
  const [editPeso, setEditPeso] = useState<string>("");
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  // form de criação
  const [idAluno, setIdAluno] = useState<string>("");
  const [alturaM, setAlturaM] = useState<string>(""); // pode vir com vírgula
  const [pesoKg, setPesoKg] = useState<string>("");   // pode vir com vírgula
  const [idProfessor, setIdProfessor] = useState<string>("");

  const ehAdmin = usuario?.cargo === "ADMIN";
  const ehProfessor = usuario?.cargo === "PROFESSOR";
  const possoCriar = ehAdmin || ehProfessor;

  // helper: "1,70" -> 1.7
  function toNumberPtBR(s: string) {
    return typeof s === "string" ? parseFloat(s.replace(",", ".")) : NaN;
  }

  // quem pode editar? ADMIN sempre; PROFESSOR apenas as próprias
  function podeEditar(av: Avaliacao) {
    if (ehAdmin) return true;
    if (ehProfessor && av.professor?.id === usuario?.id) return true;
    return false;
  }

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
          if (ehAdmin) {
            const todos = await listarUsuarios(token);
            setAlunos(todos.filter((u) => u.cargo === "ALUNO" && u.ativo));
            setProfs(todos.filter((u) => u.cargo === "PROFESSOR" && u.ativo));
          } else if (ehProfessor) {
            const soAlunos = await listarAlunos(token);
            setAlunos(soAlunos);
            setProfs([]);
            setIdProfessor(usuario!.id); // professor logado assume o próprio id
          }
        }
      } catch (e: any) {
        setErro(e.message);
      } finally {
        setCarregandoLista(false);
      }
    })();
  }, [token, possoCriar, ehAdmin, ehProfessor, usuario]);

  async function onCriar() {
    setErro(null);
    try {
      if (!token) return;

      const altura = toNumberPtBR(alturaM);
      const peso = toNumberPtBR(pesoKg);

      if (!idAluno || !isFinite(altura) || !isFinite(peso)) {
        setErro("Preencha aluno e valores válidos (ex: altura 1.70; peso 95).");
        return;
      }
      if (altura <= 0 || altura > 3) return setErro("Altura inválida (0–3 m).");
      if (peso <= 0 || peso > 400) return setErro("Peso inválido (0–400 kg).");

      setSalvando(true);

      const dados: any = { idAluno, alturaM: altura, pesoKg: peso };
      if (ehAdmin && idProfessor) dados.idProfessor = idProfessor;

      const nova = await criarAvaliacao(token, dados);
      setLista((ant) => [nova, ...ant]);
      setIdAluno(""); setAlturaM(""); setPesoKg("");
      if (ehAdmin) setIdProfessor("");
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  // entrar no modo edição
  function onEditar(av: Avaliacao) {
    setErro(null);
    setEditId(av.id);
    setEditAltura(String(av.alturaM)); // mostra com ponto; pode digitar vírgula também
    setEditPeso(String(av.pesoKg));
  }

  // cancelar edição
  function onCancelarEdicao() {
    setEditId(null);
    setEditAltura("");
    setEditPeso("");
  }

  // salvar edição
  async function onSalvarEdicao() {
    if (!token || !editId) return;
    try {
      setErro(null);
      const altura = toNumberPtBR(editAltura);
      const peso = toNumberPtBR(editPeso);

      if (!isFinite(altura) || !isFinite(peso)) {
        setErro("Informe valores válidos para altura e peso (ex: 1.70 e 95).");
        return;
      }
      if (altura <= 0 || altura > 3) return setErro("Altura inválida (0–3 m).");
      if (peso <= 0 || peso > 400) return setErro("Peso inválido (0–400 kg).");

      setSalvandoEdicao(true);

      const atualizada = await atualizarAvaliacao(token, editId, {
        alturaM: altura,
        pesoKg: peso,
      });

      setLista((ant) => ant.map((x) => (x.id === editId ? atualizada : x)));
      onCancelarEdicao();
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setSalvandoEdicao(false);
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
        <Stack direction="row">
          <BotaoVoltar />
          <Button variant="outline" onClick={sair}>Sair</Button>
        </Stack>
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
            <NativeSelect.Root size={{ base: "md", md: "sm" }}
              w={{ base: "100%", md: "260px", lg: "500px" }}>
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
              placeholder="Altura (ex: 1.70)"
              inputMode="decimal"
              value={alturaM}
              onChange={(e) => setAlturaM(e.target.value)}
            />
            <Input
              placeholder="Peso (ex: 95)"
              inputMode="decimal"
              value={pesoKg}
              onChange={(e) => setPesoKg(e.target.value)}
            />

            {ehAdmin && (
              <NativeSelect.Root size={{ base: "md", md: "sm" }}
              w={{ base: "100%", md: "260px", lg: "500px" }} >
                <NativeSelect.Field
                  placeholder="Professor (opcional)"
                  value={idProfessor}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setIdProfessor(e.target.value)
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

            <Button onClick={onCriar} loading={salvando}>Salvar</Button>
          </Stack>
        </>
      )}

      {erro && <Text color="red.500" mb={3}>{erro}</Text>}

      <Stack gap={2}>
        {carregandoLista ? (
          <Text>Carregando...</Text>
        ) : (
          lista.map((a) => {
            const emEdicao = editId === a.id;
            return (
              <Box key={a.id} p={3} border="1px solid #eee" borderRadius="md">
                <Text>
                  <b>Aluno:</b> {a.aluno?.nome} · <b>Professor:</b> {a.professor?.nome}
                </Text>

                {!emEdicao ? (
                  <>
                    <Text>
                      <b>Altura:</b> {a.alturaM} m · <b>Peso:</b> {a.pesoKg} kg
                    </Text>
                    <Text>
                      <b>IMC:</b> {a.imc} · <b>Classificação:</b> {a.classificacao}
                    </Text>
                  </>
                ) : (
                  <Stack direction={{ base: "column", md: "row" }} mt={2} gap={2}>
                    <Input
                      placeholder="Altura (ex: 1.70)"
                      inputMode="decimal"
                      value={editAltura}
                      onChange={(e) => setEditAltura(e.target.value)}
                    />
                    <Input
                      placeholder="Peso (ex: 95)"
                      inputMode="decimal"
                      value={editPeso}
                      onChange={(e) => setEditPeso(e.target.value)}
                    />
                  </Stack>
                )}

                <Text color="gray.600" fontSize="sm" mt={1}>
                  {new Date(a.avaliadoEm).toLocaleString()}
                </Text>

                {podeEditar(a) && (
                  <Stack direction="row" mt={2}>
                    {!emEdicao ? (
                      <Button size="sm" onClick={() => onEditar(a)}>
                        Editar
                      </Button>
                    ) : (
                      <>
                        <Button size="sm" onClick={onSalvarEdicao} loading={salvandoEdicao}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={onCancelarEdicao}>
                          Cancelar
                        </Button>
                      </>
                    )}
                  </Stack>
                )}
              </Box>
            );
          })
        )}
      </Stack>
    </Box>
  );
}

export default function AvaliacoesPage() {
  return (
    <Guard>
      <AvaliacoesConteudo />
    </Guard>
  );
}
