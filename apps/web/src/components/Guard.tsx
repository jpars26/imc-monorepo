// apps/web/src/components/Guard.tsx
"use client";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner, Box } from "@chakra-ui/react";
import { useAutenticacao } from "../contexts/AutenticacaoContexto";

export function Guard({
  precisaAdmin = false,
  children,
}: { precisaAdmin?: boolean; children: ReactNode }) {
  const { token, usuario, carregando } = useAutenticacao();
  const router = useRouter();

  useEffect(() => {
    if (carregando) return;
    if (!token) { router.replace("/entrar"); return; }
    if (precisaAdmin && usuario?.cargo !== "ADMIN") { router.replace("/painel"); return; }
  }, [carregando, token, usuario, precisaAdmin, router]);

  if (carregando || !token || (precisaAdmin && usuario?.cargo !== "ADMIN")) {
    return <Box p={6}><Spinner /></Box>;
  }
  return <>{children}</>;
}
