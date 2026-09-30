# Flexi — Gestão de trocas

Protótipo operacional da Ownerinc para gestão de troca de semanas.

> **Status do produto: Alpha V1 (`1.0.0-alpha.1`)**
>
> A interface e as regras centrais podem ser avaliadas de ponta a ponta, mas a
> aplicação ainda usa dados fictícios em memória e não deve operar direitos de
> uso reais.

**Prévia pública:** https://preview-steel-beta.vercel.app

**Roteiro para QA externo:** [`docs/QA-HANDOFF.md`](docs/QA-HANDOFF.md)

## Por que estamos em um Alpha do V1

Chamamos esta versão de **Alpha V1** porque ela valida a primeira experiência
completa do fluxo operacional — da identificação de uma oportunidade até a
confirmação da troca — antes de investir em infraestrutura de produção.

O Alpha já possui navegação responsiva, regras de domínio, estados de erro,
confirmações e testes automatizados. Ele ainda não é uma aplicação de produção
porque:

- não possui backend, banco de dados, autenticação ou autorização;
- o estado existe apenas na memória da aba e é reiniciado ao recarregar;
- não há upload, envio de WhatsApp ou integração externa real;
- não há concorrência, transações, trilha de auditoria persistente ou recuperação
  de falhas;
- nomes, cotas, unidades, pedidos e datas são fixtures fictícias;
- Proprietários e Novo pedido são fluxos de apoio, não módulos finais completos;
- a implementação permanece concentrada em um arquivo estático para acelerar a
  validação do produto.

Portanto, **Alpha** descreve a maturidade técnica e operacional; **V1** descreve
o primeiro recorte funcional que será validado com negócio e QA.

## O que está implementado

### Dashboard

- quatro indicadores derivados do mesmo estado usado pelas demais telas;
- busca por semana, pedido, titular ou unidade;
- listas de semanas disponíveis, pedidos em atendimento e pedidos sem
  atendimento;
- atalhos para Banco de semanas e Pedidos;
- abertura direta de semana ou detalhe da troca.

### Calendário

- inicia em **Mês**, em setembro de 2026;
- alterna entre **Ano** e **Mês**; a visão Semana não faz parte do escopo atual;
- preserva data de contexto, filtros e busca ao trocar de visualização;
- Ano apresenta os doze meses com marcadores de situação;
- Mês apresenta linhas contínuas e exclusivas do check-in ao checkout;
- meses ou dias selecionados no Ano abrem o Mês correspondente;
- períodos e itens excedentes abrem o drawer compartilhado de semana;
- oferece modo ampliado sem perder os filtros.

### Banco de semanas

- mostra somente estoque efetivamente disponível;
- permite filtrar acomodação, unidade e tipologia;
- permite buscar unidade ou titular de origem;
- mostra pedidos compatíveis respeitando a prioridade original.

### Pedidos e detalhe da troca

- lista pedidos pela data de solicitação original;
- apresenta origem, destino, consequência da transferência e metadados;
- usa quatro etapas: Pedido criado, Opção reservada, Aceite validado e Troca
  concluída;
- cobre reserva, contato, verificação de 90 dias, comprovante local, revisão,
  confirmação, observações e liberação manual;
- mantém pedidos concluídos somente para leitura;
- sincroniza mutações com Dashboard, Calendário, Banco e Pedidos durante a
  sessão.

### Fluxos de apoio

- Proprietários lista titulares, cotas e semanas ilustrativas;
- Novo pedido permite escolher uma origem e uma ou mais datas desejadas;
- a validação rejeita check-ins fora de quinta-feira ou sexta-feira.

## Baseline da demonstração

Ao abrir ou recarregar a prévia, o estado inicial esperado é:

| Indicador | Valor |
|---|---:|
| Semanas disponíveis | 15 |
| Pedidos em atendimento | 1 |
| Pedidos sem atendimento | 2 |
| Total de semanas | 60 |

- relógio fixo: **29/09/2026 às 12h UTC**;
- períodos distribuídos pelos doze meses de 2026;
- negociações demonstrativas atravessam dezembro de 2026 e janeiro de 2027;
- nenhum período anterior ao relógio da demonstração está disponível como
  estoque futuro;
- recarregar a página restaura exatamente este baseline.

## Regras de negócio exercitáveis

- Cada período tem sete noites.
- Casas têm check-in e checkout de quinta a quinta.
- Flats têm check-in e checkout de sexta a sexta.
- Cada semana original pode sustentar apenas um pedido ativo.
- A prioridade vem da data original da solicitação; reservar ou liberar não a
  reinicia.
- A origem permanece com o proprietário e fora do banco até a confirmação.
- O contato exige antecedência mínima de 90 dias da semana de origem.
- O aceite aceita PNG, JPEG, WebP ou PDF e guarda apenas metadados em memória.
- Uma reserva vencida permanece retida até liberação manual.
- Liberar a reserva devolve a opção ao banco e mantém pedido e prioridade.
- Uma semana recebida em troca não pode originar uma nova troca.
- Na confirmação, a origem entra no banco e o destino passa ao proprietário,
  marcado como recebido em troca.

## Arquitetura atual

O Alpha é intencionalmente estático e pode abrir por `file://`. Não existe etapa
de build para executar o produto.

| Caminho | Responsabilidade |
|---|---|
| `preview/index.html` | CSS, fixtures, modelo de domínio, renderização e interações do protótipo. |
| `preview/assets/` | Logo Ownerinc e fontes Novelin locais; não há dependência de CDN. |
| `scripts/check-preview.cjs` | Auditoria Playwright executada diretamente contra o arquivo local. |
| `docs/QA-HANDOFF.md` | Baseline, matriz manual, severidades e modelo de reporte para QA. |
| `docs/superpowers/specs/` | Decisões aprovadas para esta rodada de qualidade. |
| `docs/superpowers/plans/` | Planos históricos e de implementação; não são comportamento executável. |
| `.github/workflows/qa.yml` | Gate automatizado de instalação, navegador, suíte e dependências. |
| `package.json` / `package-lock.json` | Ferramentas locais de QA; não são necessárias para abrir a prévia. |

### Fluxo de dados

`weeks` e `requests`, definidos em `preview/index.html`, são a fonte única da
demonstração. Seletores derivados alimentam Dashboard, Calendário, Banco e
Pedidos. As ações de reserva, contato, confirmação e liberação validam o estado
novamente no momento do commit em memória para impedir confirmações obsoletas.

Essa arquitetura é adequada para validar produto e interação, mas a separação
em módulos, serviços e persistência é um critério para fases posteriores.

## Como executar

### Sem instalação

Abra `preview/index.html` diretamente no navegador.

### Servidor local opcional

```powershell
python -m http.server 4173 --bind 0.0.0.0 --directory preview
```

Depois acesse `http://localhost:4173`.

## Instalação e validação

Requisito: **Node.js 20 ou superior**.

Em um clone standalone comum:

```sh
npm ci
npm run qa
```

Se a pasta estiver fisicamente dentro de um workspace npm pai, como
`C:\Ownerinc\projects\Flexi-V1`, isole a instalação explicitamente:

```sh
npm ci --workspaces=false
npm run qa
```

Comandos disponíveis:

| Comando | Resultado |
|---|---|
| `npm test` | Executa a suíte Playwright do protótipo. |
| `npm run verify` | Executa a mesma verificação usada no gate de entrega. |
| `npm run smoke:public` | Compara a prévia Vercel byte a byte com `preview/index.html`. |
| `npm run audit` | Audita somente o lockfile standalone. |
| `npm run qa` | Executa verificação funcional e auditoria de dependências. |

A suíte atualiza capturas em `artifacts/`, diretório ignorado pelo Git.

## Responsividade e acessibilidade

- desktop: sidebar expandida;
- tablet: sidebar compacta;
- mobile: menu em drawer com bloqueio do conteúdo de fundo;
- Dashboard, troca e calendário se reorganizam nos três breakpoints;
- foco visível, trap e restauração de foco em camadas;
- fechamento por `Escape`;
- suporte a `prefers-reduced-motion`;
- situações usam texto, ícone ou forma, além de cor;
- o gate verifica contraste de controles-chave e estados semânticos, além da
  ausência de overflow de página.

## Limitações conhecidas — não registrar como regressão

- Recarregar apaga alterações, observações e comprovantes da sessão.
- O arquivo escolhido como comprovante não é enviado nem armazenado.
- WhatsApp, login, permissões, notificações e prazos não são integrações reais.
- Proprietários não possui uma página completa de perfil.
- Importação Excel e exportação não existem neste Alpha.
- Não há backend, API, banco de dados, telemetria ou comportamento multiusuário.
- Não há fotografias reais dos imóveis.
- A prévia pública não deve receber dados pessoais ou documentos reais.

Comportamentos diferentes dessas limitações, especialmente quebra de regras,
estado incoerente, ação irreversível incorreta, inacessibilidade ou layout
inutilizável, devem ser reportados como defeito.

## Critérios para sair do Alpha

A promoção para uma fase posterior depende de:

1. aprovação dos fluxos e regras pelo negócio e pelo QA externo;
2. definição de autenticação, perfis e autorização;
3. modelo persistente de semanas, pedidos, reservas e auditoria;
4. API transacional com controle de concorrência e idempotência;
5. armazenamento seguro de comprovantes e política de retenção;
6. tratamento de erros de rede, reprocessamento e observabilidade;
7. detalhamento final de Proprietários e Importação Excel;
8. migração do protótipo monolítico para módulos testáveis;
9. testes de integração, segurança e aceite com ambiente homologado;
10. revisão jurídica e operacional antes do uso com direitos reais.

## Escopo de segurança

Todos os registros são fictícios. A prévia não deve ser usada para inserir,
processar ou decidir sobre dados e direitos reais. Consulte o handoff antes de
abrir defeitos: [`docs/QA-HANDOFF.md`](docs/QA-HANDOFF.md).
