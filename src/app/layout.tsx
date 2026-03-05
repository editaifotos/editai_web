import type { ReactNode } from "react";
import { Space_Grotesk } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/*
 * Space Grotesk carregado com todos os pesos suportados (300–700).
 * O `variable` injeta --font-space-grotesk como CSS custom property
 * no elemento que receber a classe gerada.
 * É aplicado no <html> para que :root tenha acesso à variável —
 * necessário para o @theme do Tailwind v4 resolver corretamente.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/* Script inline que roda ANTES da hidratação do React — evita flash de tema */
const themeScript = `(function(){try{var s=localStorage.getItem('editai-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(s!=='light'&&d))document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={spaceGrotesk.variable}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
