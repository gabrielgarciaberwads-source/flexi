# Flexi — Gestão de trocas

Prévia navegável do fluxo operacional de troca de semanas. A aplicação usa a
Ownerinc como identidade principal do shell e identifica o módulo como
`Flexi · Gestão de trocas`.

Abra `preview/index.html` diretamente no navegador. A prévia é formada por
HTML, CSS e JavaScript locais, não usa API ou servidor e funciona por uma URL
`file://`.

## Produto implementado

- **Dashboard inicial:** quatro indicadores derivados do estado atual, busca e
  três listas operacionais — semanas disponíveis, pedidos em atendimento e
  pedidos sem atendimento. As linhas abrem a semana ou o pedido, e os atalhos
  levam ao Banco de semanas e a Pedidos.
- **Calendário:** abre em **Mês** e também oferece **Ano** e **Semana**. Mantém
  data de contexto, pesquisa e filtros ao trocar de visualização. Ano apresenta
  doze mini-calendários com marcadores; Mês usa grade de segunda a domingo,
  períodos contínuos e listas de overflow; Semana organiza os registros por
  data de entrada, sem régua de horários. Os itens abrem o mesmo drawer de
  semana, e o calendário pode ocupar uma visão ampliada.
- **Detalhe da troca:** mostra metadados, origem, destino, consequência da
  transferência e quatro etapas: Pedido criado, Opção reservada, Aceite
  validado e Troca concluída. As ações disponíveis dependem do estado e cobrem
  reserva, contato, comprovante local, revisão, confirmação, liberação manual e
  observações em memória. Pedidos concluídos ficam somente para leitura.
- **Demais acessos:** Banco de semanas, Pedidos, Proprietários e Novo pedido
  continuam navegáveis. Seus layouts não fizeram parte deste redesign.

## Regras preservadas

- Cada período tem sete noites: casas de quinta a quinta e flats de sexta a
  sexta.
- Cada semana original pode sustentar apenas um pedido ativo.
- A prioridade é definida pela data da solicitação original; reservar ou liberar
  uma opção não reinicia essa prioridade.
- A semana de origem permanece com o proprietário e fora do banco até a
  confirmação da troca.
- O registro de contato verifica a antecedência mínima de 90 dias da semana de
  origem.
- O aceite de WhatsApp aceita PNG, JPEG, WebP ou PDF e permanece somente no
  navegador; nenhum arquivo é enviado.
- Uma reserva vencida continua retida até a liberação manual. A liberação
  devolve a opção ao banco e mantém o pedido aberto.
- Uma semana recebida em troca não pode originar outra troca.
- Na confirmação, a origem entra no banco e o destino sai do banco, passa ao
  proprietário e é marcado como recebido em troca.

Dashboard, Calendário, Banco de semanas e Pedidos derivam dos mesmos dados em
memória e refletem essas mutações durante a sessão.

## Dados da demonstração

Nomes, semanas, pedidos e registros são fictícios. Todo o estado existe apenas
em memória; recarregar a página reinicia a demonstração. O relógio da prévia é
fixo em 29/09/2026 às 12h (UTC), e o calendário inicia no conjunto fictício de
abril de 2027.

Esta prévia simula o fluxo e não altera direitos de uso reais.

## Responsividade e acessibilidade

- No desktop, a navegação lateral fica expandida; no tablet, compacta; no
  mobile, abre como drawer.
- Indicadores e colunas do Dashboard, painéis da troca e progresso se reorganizam
  para tablet e mobile. Regiões densas do calendário usam rolagem interna quando
  necessário, sem criar rolagem horizontal na página.
- A interface preserva navegação por teclado, foco visível, fechamento e retorno
  de foco com `Escape`, bloqueio do conteúdo atrás de drawers/modais e suporte a
  `prefers-reduced-motion`.
- Situações operacionais usam texto, ícone ou forma além da cor.

## Instalação e validação

A prévia não precisa de instalação para ser aberta. Para executar a suíte de
validação em um clone novo do repositório, instale as dependências locais:

```sh
npm ci
```

Depois, na raiz do repositório, execute:

```sh
npm run verify
```

O check abre a prévia por `file://`, exercita regras e interações com Playwright
e atualiza as capturas em `artifacts/` para revisão visual.

## Fora do escopo atual

As seguintes telas permanecem adiadas:

- **Detalhe do proprietário**;
- **Importação via Excel**.

Também não fazem parte desta prévia backend, autenticação, persistência, exportação,
concorrência/transações reais ou fotografias reais dos imóveis.
