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
              Crie sua conta gratuita, envie suas fotos e receba resultados
              profissionais com inteligência artificial.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/criar_conta">
                <Button size="lg">Criar conta</Button>
              </Link>
              <Link href="/download">
                <Button variant="secondary" size="lg">Baixar o app</Button>
              </Link>
            </div>
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
                    Sua imagem está pronta. Gere novas variações quando quiser.
                  </p>
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
        subtitle="Você só precisa baixar o app, enviar suas fotos e deixar a IA fazer o resto."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Baixe o app",
              description: "Baixe o Editai gratuitamente na Google Play ou App Store.",
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
                title: "100% gratuito",
                description: "Use o Editai sem custo. Crie e edite fotos com IA quando quiser.",
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
              Use o Editai gratuitamente, sem complicações.
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
                  <Link href="/download">
                    <Button variant="secondary" size="lg">Baixar o app</Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </Container>
      </Section>
    </div>
  );
}
