import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="bg-app">
      {/* ── Hero ── */}
      <Section className="pt-8 md:pt-16">
        <Container className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-light">
              Edição de fotos com IA
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-primary md:text-5xl">
              Crie e edite fotos com o poder da IA
            </h1>
            <p className="max-w-md text-sm text-secondary md:text-base">
              Transforme suas ideias em imagens incríveis em poucos cliques.
              Assine um plano, envie suas fotos e receba resultados profissionais
              com inteligência artificial.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/criar_conta">
                <Button size="lg">Criar conta</Button>
              </Link>
              <a href="#planos">
                <Button variant="secondary" size="lg">Ver planos</Button>
              </a>
            </div>
            <p className="text-xs text-tertiary">Sem compromisso. Cancele quando quiser.</p>
          </div>

          {/* Mockup do app */}
          <div className="relative">
            <div className="pointer-events-none absolute -top-10 right-0 h-60 w-60 rounded-full bg-brand/20 blur-3xl" />
            <Card className="relative mx-auto max-w-sm overflow-hidden bg-surface-2 p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-secondary">
                  App Editai
                </span>
                <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                  IA ativa
                </span>
              </div>
              <div className="space-y-3 rounded-2xl bg-canvas p-4">
                <div className="h-40 rounded-2xl bg-gradient-to-br from-brand via-brand-dark to-brand-light" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-primary">Nova edição criada</p>
                  <p className="text-xs text-secondary">
                    Sua imagem está pronta. Use mais créditos para gerar novas variações.
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-surface px-3 py-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-primary">Créditos disponíveis</p>
                    <p className="text-xs text-secondary">120 créditos</p>
                  </div>
                  <Button size="sm">Comprar créditos</Button>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      {/* ── Como funciona ── */}
      <Section
        id="como-funciona"
        title="Como o Editai funciona"
        subtitle="Você só precisa escolher um plano, enviar suas fotos e deixar a IA fazer o resto."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Escolha um plano",
              description: "Selecione o pacote de créditos que mais combina com a sua rotina.",
            },
            {
              step: "02",
              title: "Envie suas fotos",
              description: "Envie fotos ou descrições e deixe nossa IA entender o que você precisa.",
            },
            {
              step: "03",
              title: "Receba as criações",
              description:
                "Receba imagens prontas para usar em redes sociais, negócios ou projetos pessoais.",
            },
          ].map((item) => (
            <Card key={item.step} className="h-full p-6">
              <span className="mb-4 block text-xs font-semibold text-brand">{item.step}</span>
              <h3 className="mb-2 text-base font-semibold text-primary md:text-lg">{item.title}</h3>
              <p className="text-sm text-secondary">{item.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ── Planos ── */}
      <Section
        id="planos"
        title="Planos para o seu momento"
        subtitle="Comece no seu ritmo. Você pode assinar um plano mensal e comprar créditos extras quando precisar."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="flex h-full flex-col p-6">
            <h3 className="text-base font-semibold text-primary md:text-lg">Básico</h3>
            <p className="mt-1 text-sm text-secondary">Ideal para testar o Editai e criar edições pontuais.</p>
            <p className="mt-4 text-3xl font-bold tracking-tight text-primary">
              R$ 29<span className="text-sm font-normal text-secondary">/mês</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-secondary">
              <li>• 100 créditos por mês</li>
              <li>• Geração básica de fotos</li>
              <li>• Suporte por email</li>
            </ul>
            <Button className="mt-6 w-full">Assinar</Button>
          </Card>

          <Card highlighted className="relative flex h-full flex-col p-6">
            <span className="absolute right-4 top-4 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
              Mais popular
            </span>
            <h3 className="text-base font-semibold text-primary md:text-lg">Pro</h3>
            <p className="mt-1 text-sm text-secondary">Perfeito para criadores de conteúdo e pequenos negócios.</p>
            <p className="mt-4 text-3xl font-bold tracking-tight text-primary">
              R$ 79<span className="text-sm font-normal text-secondary">/mês</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-secondary">
              <li>• 400 créditos por mês</li>
              <li>• Fila prioritária</li>
              <li>• Resultados em alta resolução</li>
            </ul>
            <Button className="mt-6 w-full">Assinar</Button>
          </Card>

          <Card className="flex h-full flex-col p-6">
            <h3 className="text-base font-semibold text-primary md:text-lg">Premium</h3>
            <p className="mt-1 text-sm text-secondary">Para quem precisa de volume e máxima flexibilidade.</p>
            <p className="mt-4 text-3xl font-bold tracking-tight text-primary">
              R$ 149<span className="text-sm font-normal text-secondary">/mês</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-secondary">
              <li>• 1.000 créditos por mês</li>
              <li>• Suporte prioritário</li>
              <li>• Créditos extras com desconto</li>
            </ul>
            <Button className="mt-6 w-full">Assinar</Button>
          </Card>
        </div>
      </Section>

      {/* ── Benefícios ── */}
      <Section
        title="Pensado para criadores, marcas e você"
        subtitle="O Editai é um estúdio de criação com IA, sempre disponível quando você precisar."
      >
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-4">
            {[
              {
                title: "IA de última geração",
                description: "Tecnologia atualizada constantemente para entregar resultados cada vez melhores.",
              },
              {
                title: "Resultados em minutos",
                description: "Envie suas fotos e receba as criações prontas em poucos instantes.",
              },
              {
                title: "Créditos flexíveis",
                description: "Use seus créditos como quiser e compre mais a qualquer momento.",
              },
              {
                title: "Segurança e privacidade",
                description: "Suas imagens são tratadas com segurança e respeito à sua privacidade.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <span className="text-xs" aria-hidden="true">✓</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary md:text-base">{item.title}</h3>
                  <p className="text-sm text-secondary">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <Card className="h-full bg-surface-2 p-6">
            <h3 className="text-base font-semibold text-primary md:text-lg">
              Pronto para integrar com o seu fluxo
            </h3>
            <p className="mt-2 text-sm text-secondary">
              O Editai foi pensado para se encaixar no seu dia a dia: use para criar conteúdos para
              redes sociais, vitrines de e-commerce, fotos profissionais ou projetos pessoais.
            </p>
            <p className="mt-3 text-sm text-secondary">
              Comece com poucos créditos e aumente conforme seu uso cresce, sem complicações.
            </p>
          </Card>
        </div>
      </Section>

      {/* ── CTA Final ── */}
      <Section className="pb-20">
        <Container>
          <Card className="overflow-hidden">
            <div className="relative px-6 py-10 md:px-10 md:py-12">
              <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 rounded-r-2xl bg-brand/10" />
              <div className="relative max-w-xl space-y-4">
                <h2 className="text-2xl font-semibold tracking-tight text-primary md:text-3xl">
                  Pronto para criar suas próximas fotos com IA?
                </h2>
                <p className="text-sm text-secondary md:text-base">
                  Crie sua conta em poucos segundos e comece a transformar suas ideias em imagens
                  profissionais.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/criar_conta">
                    <Button size="lg">Criar conta agora</Button>
                  </Link>
                  <a href="#planos">
                    <Button variant="secondary" size="lg">Ver planos</Button>
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </Container>
      </Section>
    </div>
  );
}
