import { Container } from "@/components/ui/container";

export default function PoliticasDePrivacidadePage() {
  return (
    <main className="bg-app">
      <section className="py-16 md:py-20">
        <Container className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Políticas de Privacidade
          </h1>
          <p className="mt-3 text-sm text-secondary md:text-base">
            Esta página descreve como o Editai trata seus dados pessoais e
            informações ao utilizar nossos aplicativos e serviços.
          </p>

          <div className="mt-10 space-y-6 text-sm text-secondary md:text-base">
            <section>
              <h2 className="text-lg font-semibold text-primary md:text-xl">
                1. Introdução
              </h2>
              <p className="mt-2">
                O Editai é um serviço que utiliza inteligência artificial para
                criar e editar fotos. Para oferecer essa experiência, podemos
                coletar algumas informações sobre você e sobre o uso da
                plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary md:text-xl">
                2. Dados coletados
              </h2>
              <p className="mt-2">
                Podemos coletar informações como nome, e-mail, dados de uso,
                imagens enviadas para processamento e dados técnicos do
                dispositivo. Esses dados são utilizados exclusivamente para
                operar e melhorar nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary md:text-xl">
                3. Uso das informações
              </h2>
              <p className="mt-2">
                Utilizamos seus dados para processar imagens, oferecer suporte,
                melhorar a qualidade do produto, prevenir fraudes e cumprir
                obrigações legais. Não vendemos suas informações pessoais.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary md:text-xl">
                4. Direitos do usuário
              </h2>
              <p className="mt-2">
                Você pode solicitar acesso, correção ou exclusão de seus dados,
                bem como tirar dúvidas sobre como eles são tratados. Entre em
                contato conosco para exercer esses direitos.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary md:text-xl">
                5. Contato
              </h2>
              <p className="mt-2">
                Em caso de dúvidas sobre estas políticas, entre em contato pelo
                e-mail de suporte indicado nos canais oficiais do Editai.
              </p>
            </section>
          </div>
        </Container>
      </section>
    </main>
  );
}

