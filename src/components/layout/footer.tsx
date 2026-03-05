import Link from "next/link";
import { Container } from "@/components/ui/container";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-default bg-surface-glass backdrop-blur-md">
      <Container className="flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-2xl bg-brand text-xs font-bold text-white shadow-md">
              E
            </span>
            <span className="text-sm font-semibold tracking-tight text-primary md:text-base">
              Editai
            </span>
          </div>
          <p className="max-w-sm text-xs text-secondary md:text-sm">
            Crie e edite fotos com o poder da IA em poucos cliques.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm text-secondary md:flex-row md:items-center md:gap-6">
          <div className="flex gap-4">
            <Link href="/politicas_de_privacidade" className="transition-colors hover:text-primary">
              Políticas de Privacidade
            </Link>
            <Link href="/termos_de_uso" className="transition-colors hover:text-primary">
              Termos de Uso
            </Link>
          </div>
          <p className="text-xs text-tertiary md:text-sm">
            © {year} Editai. Todos os direitos reservados.
          </p>
        </div>
      </Container>
    </footer>
  );
}
