// apps/web/src/app/providers.tsx
"use client";

import * as React from "react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { AutenticacaoProvider } from "../contexts/AutenticacaoContexto";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <ChakraProvider value={defaultSystem}>
        <AutenticacaoProvider>{children}</AutenticacaoProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}
