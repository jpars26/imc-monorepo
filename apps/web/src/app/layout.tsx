// apps/web/src/app/layout.tsx
import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = { title: "IMC", description: "Painel IMC" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
