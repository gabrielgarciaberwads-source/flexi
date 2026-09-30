# Flexi Alpha V1 — QA Readiness Design

**Data:** 30/09/2026  
**Status:** aprovado para planejamento  
**Escopo:** auditoria completa do Alpha V1 sem refatoração estrutural do protótipo

## Objetivo

Preparar o repositório standalone do Flexi para avaliação por um QA externo. A
entrega deve ser verificável, não contradizer o comportamento atual e separar
claramente defeitos de limitações deliberadas do Alpha V1.

## Decisão de arquitetura

O Alpha V1 continuará como uma aplicação estática, sem build de produto, com
HTML, CSS, JavaScript, fixtures e modelo de domínio reunidos em
`preview/index.html`. Essa escolha preserva a abertura direta por `file://`,
reduz mudanças de alto risco antes do QA e mantém a demonstração portátil.

A concentração em um arquivo é dívida arquitetural conhecida. A divisão em
módulos, a adoção de persistência e a criação de fronteiras de aplicação ficam
para uma fase posterior ao Alpha, quando os fluxos e regras forem validados.

## Higiene técnica

A auditoria deve:

- remover resíduos funcionais e estilísticos da antiga visualização Semana e do
  explorador de ícones/movimento;
- eliminar datas antigas que não pertençam ao conjunto atual de 2026–2027;
- manter apenas a família de ícones efetivamente usada;
- isolar comandos npm do workspace pai em que a pasta ainda está fisicamente
  localizada;
- declarar a versão como `1.0.0-alpha.1` e Node.js 20 ou superior;
- preservar o funcionamento por `file://` e a prévia pública estática.

## Documentação para terceiros

O `README.md` será a entrada principal e deverá explicar:

- o que significa Alpha V1;
- por que a solução ainda não é produção;
- funcionalidades implementadas e regras de negócio exercitáveis;
- estrutura e responsabilidade de cada arquivo relevante;
- instalação, comandos de QA e evidências geradas;
- limitações conhecidas e critérios de saída do Alpha.

Um `docs/QA-HANDOFF.md` fornecerá ao avaliador:

- baseline de dados e contagens esperadas;
- matriz de testes manuais por fluxo;
- breakpoints e critérios de acessibilidade;
- classificação de severidade;
- formato mínimo de relato de defeito;
- itens fora de escopo que não devem ser registrados como regressão.

O plano original de redesign será mantido como registro histórico, com aviso de
que a visão Semana foi posteriormente removida por decisão de produto.

## Cobertura automatizada

A suíte Playwright continuará executando a aplicação por `file://` e deverá
cobrir todos os compromissos públicos do README:

1. shell, ativos locais, tipografia e avatar circular;
2. Dashboard, busca, métricas e atalhos;
3. Calendário Ano/Mês, filtros, busca, estado vazio, navegação e overflow;
4. Banco, Pedidos, Proprietários e Novo pedido;
5. períodos de sete noites e dias corretos de check-in;
6. prioridade de solicitações e origem única por pedido ativo;
7. reserva, antecedência de 90 dias positiva e negativa;
8. evidência local válida e inválida;
9. proteção contra confirmação baseada em estado obsoleto;
10. confirmação, sincronização entre telas e bloqueio de nova troca para semana
    recebida;
11. liberação manual de reserva vencida sem perda de prioridade;
12. foco, `Escape`, movimento reduzido, contraste, console e overflow nos três
    breakpoints.

## Segurança e dados

O Alpha não transmite dados nem arquivos. Todos os nomes e registros são
fixtures fictícias; anexos são representados apenas por metadados em memória.
A auditoria de dependências deve ser executada contra o `package-lock.json`
standalone, não contra o monorepo pai. Vulnerabilidades do workspace pai não são
atribuíveis ao Flexi.

## Critérios de aceite

A entrega estará pronta para o QA externo quando:

- a árvore Git estiver limpa e sincronizada com `origin/main`;
- uma instalação limpa concluir sem vulnerabilidades conhecidas;
- a suíte automatizada passar sem erros de console;
- README, handoff e comportamento não apresentarem contradições;
- a prévia pública responder com a mesma revisão do repositório;
- limitações do Alpha e critérios de promoção estiverem explícitos;
- não restarem marcadores `TODO`, `FIXME`, datas antigas ou controles removidos
  no código do produto.

## Fora deste trabalho

Não serão adicionados backend, autenticação, banco de dados, upload real,
integração com WhatsApp, concorrência, importação Excel, exportação, detalhe
completo do proprietário ou fotografias reais. Também não será feita a
modularização ampla de `preview/index.html` nesta rodada.
