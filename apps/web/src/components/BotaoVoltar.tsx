// apps/web/src/components/BotaoVoltar.tsx
"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

type Props = {
  /** rota usada quando não há histórico para voltar */
  fallback?: string;
  /** texto do botão */
  children?: React.ReactNode;
} & Omit<ButtonProps, "onClick">;

export function BotaoVoltar({
  fallback = "/painel",
  children = "Voltar",
  ...btnProps
}: Props) {
  const router = useRouter();
  const [navegando, setNavegando] = React.useState(false);

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      setNavegando(true);
      router.push(fallback);
    }
  }

  return (
    <Button
      onClick={handleClick}
      aria-label="Voltar"
      disabled={navegando}
      variant="outline"
      {...btnProps}
    >
      {children}
    </Button>
  );
}
