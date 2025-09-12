// apps/web/src/contexts/AutenticacaoContexto.tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { buscarMe, entrar as apiEntrar, type Usuario } from "../lib/api";

type Ctx = {
  token: string | null;
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => void;
};

const AutCtx = createContext<Ctx | undefined>(undefined);
const STORAGE_TOKEN = "imc_token";

export function AutenticacaoProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem(STORAGE_TOKEN) : null;
    if (!t) { setCarregando(false); return; }

    (async () => {
      try {
        setToken(t);
        const me = await buscarMe(t);      // <-- agora chama /auth/me
        setUsuario(me);
      } catch (e: any) {
        // Só limpa token se for realmente auth error (401/403)
        if (e?.status === 401 || e?.status === 403) {
          localStorage.removeItem(STORAGE_TOKEN);
          setToken(null);
          setUsuario(null);
        } else {
          // Falha transitória (CORS/offline/etc) — mantém token e loga no console
          console.warn("Falha ao validar /auth/me; mantendo token:", e);
          setToken(t);
        }
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    const resp = await apiEntrar(email, senha);
    localStorage.setItem(STORAGE_TOKEN, resp.token);
    setToken(resp.token);
    setUsuario(resp.usuario);
  }, []);

  const sair = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN);
    setToken(null);
    setUsuario(null);
  }, []);

  const value = useMemo(() => ({ token, usuario, carregando, entrar, sair }), [token, usuario, carregando, entrar, sair]);
  return <AutCtx.Provider value={value}>{children}</AutCtx.Provider>;
}

export function useAutenticacao() {
  const ctx = useContext(AutCtx);
  if (!ctx) throw new Error("useAutenticacao deve ser usado dentro de AutenticacaoProvider");
  return ctx;
}
