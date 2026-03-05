import { Container } from "@/components/ui/container";

export default function TermosDeUsoPage() {
  return (
    <main className="bg-app">
      <section className="py-16 md:py-20">
        <Container className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Termos de Uso
          </h1>
          <p className="mt-3 text-sm text-secondary md:text-base">
            Ao utilizar o Editai, você concorda com os termos abaixo. Recomendamos
            que leia este documento com atenção.
          </p>

          <div className="mt-10 space-y-6 text-sm text-secondary md:text-base">
            <section>
              <h2 className="text-lg font-semibold text-primary md:text-xl">
                1. Aceitação dos termos
              </h2>
              <p className="mt-2">
                Ao criar uma conta ou utilizar nossos serviços, você declara que
                leu, entendeu e concorda com estes Termos de Uso e com nossas
                Políticas de Privacidade.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary md:text-xl">
                2. Uso permitido
              </h2>
              <p className="mt-2">
                O Editai deve ser utilizado de forma responsável, respeitando
                direitos autorais, leis vigentes e a privacidade de terceiros.
                É proibido usar a plataforma para fins ilegais ou abusivos.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary md:text-xl">
                3. Limitações de responsabilidade
              </h2>
              <p className="mt-2">
                Embora busquemos oferecer o melhor serviço possível, o Editai é
                fornecido &quot;como está&quot;, sem garantias de disponibilidade
                contínua ou resultados específicos nas imagens geradas.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary md:text-xl">
                4. Alterações nos termos
              </h2>
              <p className="mt-2">
                Podemos atualizar estes Termos de Uso periodicamente. Quaisquer
                alterações relevantes serão comunicadas pelos canais oficiais do
                Editai.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary md:text-xl">
                5. Foro
              </h2>
              <p className="mt-2">
                Em caso de conflitos relacionados a estes termos, será utilizado o
                foro competente conforme a legislação aplicável.
              </p>
            </section>
          </div>
        </Container>
      </section>
    </main>
  );
}

