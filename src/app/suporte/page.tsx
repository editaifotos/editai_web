import { Container } from "@/components/ui/container";

export default function SuportePage() {
  return (
    <main className="bg-app">
      <section className="py-16 md:py-20">
        <Container className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
            Suporte
          </h1>
          <p className="mt-3 text-sm text-secondary md:text-base">
            Encontre respostas para as dúvidas mais comuns ou entre em contato
            conosco.
          </p>

          <div className="mt-10 space-y-8 text-sm text-secondary md:text-base">
            <section>
              <h2 className="text-lg font-semibold text-primary md:text-xl">
                Perguntas frequentes
              </h2>

              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="font-medium text-primary">
                    Minha edição não ficou como esperado. O que fazer?
                  </h3>
                  <p className="mt-2">
                    Tente ajustar a descrição ou a foto de referência e gerar
                    novamente. Se o problema persistir, entre em contato pelo
                    e-mail ou WhatsApp informando o que esperava e o que
                    aconteceu. Nossa equipe analisa e entra em contato para ajudar.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-primary">
                    O app não está funcionando. Como resolver?
                  </h3>
                  <p className="mt-2">
                    Verifique se está usando a versão mais recente do app e se
                    sua conexão com a internet está estável. Feche e abra o app
                    novamente. Se o problema continuar, desinstale e reinstale o
                    aplicativo. Caso persista, entre em contato conosco.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-primary">
                    Posso usar as imagens criadas comercialmente?
                  </h3>
                  <p className="mt-2">
                    Sim. As imagens geradas pelo Editai podem ser usadas para
                    fins pessoais e comerciais, de acordo com nossos Termos de
                    Uso. Consulte a seção de licenciamento para mais detalhes.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary md:text-xl">
                Entre em contato
              </h2>
              <p className="mt-2">
                Não encontrou o que procurava? Nossa equipe está pronta para
                ajudar.
              </p>
              <div className="mt-4 space-y-2">
                <p>
                  <span className="font-medium text-primary">E-mail:</span>{" "}
                  <a
                    href="mailto:suporte@editai.com.br"
                    className="text-primary underline transition-colors hover:text-brand"
                  >
                    suporte@editai.com.br
                  </a>
                </p>
                <p>
                  <span className="font-medium text-primary">WhatsApp:</span>{" "}
                  <a
                    href="https://wa.me/5511999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline transition-colors hover:text-brand"
                  >
                    Enviar mensagem
                  </a>
                </p>
              </div>
            </section>
          </div>
        </Container>
      </section>
    </main>
  );
}
