// apps/web/src/app/entrar/page.tsx
"use client";
import { Box, Button, Heading, Input, Stack, Text, Card, Spinner } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAutenticacao } from "../../contexts/AutenticacaoContexto";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Schema = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  senha: z.string().min(6, { message: "Mínimo 6 caracteres" }),
});
type FormDados = z.infer<typeof Schema>;

export default function EntrarPage() {
  const { entrar, carregando, token } = useAutenticacao();
  const { register, handleSubmit, formState: { errors } } = useForm<FormDados>({ resolver: zodResolver(Schema) });
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  // já autenticado? manda para o painel
  useEffect(() => {
    if (!carregando && token) router.replace("/painel");
  }, [carregando, token, router]);

  async function onSubmit(dados: FormDados) {
    setErro(null);
    try {
      await entrar(dados.email, dados.senha);
      router.replace("/painel");
    } catch (e: any) {
      setErro(e?.message || "Falha ao entrar");
    }
  }

  // enquanto hidrata, mostra um loading simples
  if (carregando) {
    return (
      <Box minH="100dvh" display="grid" placeItems="center">
        <Spinner />
      </Box>
    );
  }

  // se já tem token, o useEffect acima vai redirecionar;
  // retornamos null para evitar flicker
  if (token) return null;

  return (
    <Box minH="100dvh" display="grid" placeItems="center" p={6}>
      <Card.Root w="100%" maxW="420px" boxShadow="lg" borderRadius="md">
        <Card.Body>
          <Stack gap={4}>
            <Heading size="md">Entrar</Heading>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack gap={3}>
                <Box>
                  <Input placeholder="E-mail" type="email" {...register("email")} />
                  {errors.email && <Text color="red.500" fontSize="sm">{errors.email.message}</Text>}
                </Box>
                <Box>
                  <Input placeholder="Senha" type="password" {...register("senha")} />
                  {errors.senha && <Text color="red.500" fontSize="sm">{errors.senha.message}</Text>}
                </Box>
                {erro && <Text color="red.500" fontSize="sm">{erro}</Text>}
                <Button type="submit" loading={carregando}>Entrar</Button>
              </Stack>
            </form>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}
