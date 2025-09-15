// apps/web/src/app/painel/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  Image, 
} from "@chakra-ui/react";
import { useAutenticacao } from "../../contexts/AutenticacaoContexto";
import { buscarMe } from "../../lib/api";
import { Guard } from "../../components/Guard";

function PainelConteudo() {
  const { usuario, token, sair } = useAutenticacao();

  // valida o token (se inválido, faz logout)
  useEffect(() => {
    if (!token) return;
    buscarMe(token).catch(() => {
      sair();
    });
  }, [token, sair]);

  const ehAdmin = usuario?.cargo === "ADMIN";
  const ehProfessor = usuario?.cargo === "PROFESSOR";

  return (
    <Box p={6}>

      <Stack
        direction="row"
        justify="space-between"
        align="center"
        mb={6}
      >
        <Stack direction="row" align="center" gap={3}>

          <Image
            src="/logo.svg"
            alt="Logo da empresa"
            boxSize={{ base: "100px", md: "100px" }} 
          />
          <Heading size="lg">Painel</Heading>
        </Stack>

        <Button variant="outline" onClick={sair}>
          Sair
        </Button>
      </Stack>

      <Box bg="gray.50" p={4} borderRadius="md">
        <Text><b>Nome:</b> {usuario?.nome}</Text>
        <Text><b>E-mail:</b> {usuario?.email}</Text>
        <Text><b>Cargo:</b> {usuario?.cargo}</Text>
        <Text><b>Status:</b> {usuario?.ativo ? "Ativo" : "Inativo"}</Text>
      </Box>

      <Stack direction="row" mt={6} gap={3} wrap="wrap">
        {/* qualquer autenticado */}
        <Button asChild>
          <Link href="/avaliacoes">Avaliações</Link>
        </Button>

        {/* ADMIN: gerencia todos os usuários */}
        {ehAdmin && (
          <Button asChild variant="outline">
            <Link href="/usuarios">Usuários</Link>
          </Button>
        )}

        {/* PROFESSOR: gerencia apenas ALUNOS (sua tela dedicada) */}
        {ehProfessor && (
          <Button asChild variant="outline">
            <Link href="/alunos">Alunos</Link>
          </Button>
        )}
      </Stack>
    </Box>
  );
}

export default function PainelPage() {
  return (
    <Guard>
      <PainelConteudo />
    </Guard>
  );
}
