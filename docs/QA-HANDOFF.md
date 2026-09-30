# Flexi Alpha V1 — Handoff para QA externo

## Identificação da entrega

- produto: **Flexi · Gestão de trocas**;
- versão: **1.0.0-alpha.1**;
- branch de referência: `main`;
- referência imutável da entrega: tag `v1.0.0-alpha.1`;
- SHA-256 de `preview/index.html`:
  `6768a1e4a7658733a406f28080d526bc1f2e5842dcbf2bbae1b75fcdaf7cffa9`;
- data fixa da demonstração: **29/09/2026, 12h UTC**;
- prévia: https://preview-steel-beta.vercel.app;
- repositório: privado;
- dados: integralmente fictícios e reiniciados no reload.

Leia primeiro a seção “Por que estamos em um Alpha do V1” do `README.md`.
Este documento diferencia defeitos do produto de limitações deliberadas do
protótipo.

## Preparação do ambiente

### Opção 1 — prévia pública

Abra a URL da prévia em uma janela anônima. Não insira dados pessoais,
documentos reais ou informações de proprietários reais.

### Opção 2 — arquivo local

Abra `preview/index.html` diretamente em Chrome ou Edge.

### Opção 3 — servidor local

```powershell
python -m http.server 4173 --bind 127.0.0.1 --directory preview
```

Acesse `http://127.0.0.1:4173`.

### Suíte automatizada

Requer Node.js 20 ou superior.

```sh
npm ci --workspaces=false
npm run qa
npm run smoke:public
```

O argumento `--workspaces=false` é obrigatório nesta cópia quando ela está
dentro de `C:\Ownerinc`, para impedir que o npm use dependências do workspace
pai. Em um clone standalone fora de outro workspace, `npm ci` também é válido.

## Baseline esperado após reload

| Evidência | Esperado |
|---|---:|
| Semanas disponíveis | 15 |
| Pedidos em atendimento | 1 |
| Pedidos sem atendimento | 2 |
| Total de semanas | 60 |
| Pedido em atendimento | `TR-0082` |
| Pedidos sem atendimento | `TR-0087`, `TR-0088` |
| Calendário inicial | setembro de 2026, visualização Mês |
| Modos do calendário | Ano e Mês |

Se o estado estiver diferente, recarregue a página antes de registrar o
defeito. Persistência após reload não é esperada no Alpha.

## Matriz de testes manuais

### QA-BOOT-01 — Inicialização limpa

1. Abra ou recarregue a prévia.
2. Confirme a identificação `Alpha V1 · dados fictícios`.
3. Compare os quatro indicadores com o baseline.
4. Abra o console do navegador.

**Aceite:** Dashboard é a primeira tela; logo e fonte carregam; não há erro no
console nem rolagem horizontal da página.

### QA-DASH-01 — Busca unificada

1. Busque `SEM-223`.
2. Abra o único resultado em Semanas disponíveis.
3. Feche com `Escape`.
4. Busque `TR-0087` e abra o pedido.

**Aceite:** a primeira busca mostra Flat 01, 08/01/2027–15/01/2027; a segunda
abre o detalhe de João Pedro; o foco retorna ao acionador ao fechar o drawer.

### QA-NAV-01 — Navegação principal e atalhos

1. Percorra Dashboard, Calendário, Banco, Pedidos e Proprietários.
2. Use cada `Ver todos` do Dashboard.
3. Em Proprietários, abra `Ver semanas`.

**Aceite:** todos os destinos abrem; breadcrumb e item ativo são coerentes; não
há tela vazia, erro ou retorno para seção errada.

### QA-CAL-01 — Calendário Mês

1. Abra Calendário.
2. Confirme setembro de 2026 e quatro semanas visíveis.
3. Avance para outubro.
4. Abra uma linha e um botão `+1 itens`.
5. Use filtros e uma busca sem correspondência.

**Aceite:** linhas começam no check-in e terminam no checkout; períodos que
cruzam a semana são contínuos; overflow abre a lista; estado vazio é claro.

### QA-CAL-02 — Calendário Ano

1. Selecione Ano.
2. Navegue para 2025, use Hoje e depois avance para 2027.
3. Em 2026, selecione outubro e depois um dia.

**Aceite:** 2025 permanece navegável e vazio; Hoje retorna a 2026; 2027 mostra
dois registros; mês e dia abrem Mês, nunca uma visão Semana.

### QA-BANK-01 — Estoque e compatibilidade

1. Abra Banco de semanas.
2. Confirme outubro de 2026 e seis períodos.
3. Filtre Flats, Flat 02, Tipologia A e `Juliana`.
4. Navegue até janeiro de 2027 e abra `SEM-223`.

**Aceite:** Banco nunca mostra estado diferente de Disponível; Flat 02 retorna
uma opção em outubro; `SEM-223` mostra dois pedidos compatíveis na ordem de
prioridade.

### QA-EXC-01 — Prioridade

1. Abra `TR-0088` em Pedidos.
2. Observe a opção disponível.
3. Volte e abra `TR-0087`.

**Aceite:** `TR-0088` aparece em 2º e não pode reservar; `TR-0087` aparece em
1º e pode reservar.

### QA-EXC-02 — Reserva e antecedência

1. Em `TR-0087`, reserve `SEM-223`.
2. Registre o contato.

**Aceite:** a origem continua com João Pedro; o destino fica Em negociação; o
modal informa 93 dias e aceita o registro por superar o mínimo de 90.

### QA-EXC-03 — Evidência local

1. Após o contato, tente anexar um arquivo `.txt`.
2. Anexe PNG, JPEG, WebP ou PDF fictício.

**Aceite:** `.txt` é rejeitado; formato permitido habilita Revisar e confirmar;
o nome aparece, mas nenhum upload ou transmissão ocorre.

### QA-EXC-04 — Confirmação e sincronização

1. Adicione uma observação.
2. Revise e confirme a troca de `TR-0087`.
3. Consulte Dashboard, Calendário, Banco e Pedidos.

**Aceite:** pedido fica Concluído e somente leitura; origem `SEM-200` entra no
Banco; destino `SEM-223` sai do Banco, passa para João Pedro e fica indisponível
como origem de novo pedido; todas as telas refletem a mudança.

### QA-EXC-05 — Reserva vencida

1. Abra `TR-0082`.
2. Selecione Liberar reserva e confirme.

**Aceite:** a ação nunca é chamada de cancelamento; `SEM-190` volta ao Banco;
`TR-0082` permanece Aberto com prioridade de 08/09/2026.

### QA-NEW-01 — Novo pedido

1. Abra Novo pedido.
2. Escolha uma origem.
3. Adicione e remova uma alternativa.
4. Informe `05/01/2027` e tente criar.
5. Substitua por `08/01/2027`.

**Aceite:** a primeira data é rejeitada; a segunda é sexta-feira e cria o
pedido; semanas recebidas em troca não aparecem como origem elegível.

### QA-A11Y-01 — Teclado e camadas

1. Navegue apenas com Tab e Shift+Tab.
2. Abra menu mobile, drawers e confirmações.
3. Use `Escape` em cada camada.
4. Ative redução de movimento no sistema.

**Aceite:** foco visível; foco preso dentro da camada aberta; conteúdo de fundo
não acessível; fechamento restaura foco; animações não essenciais são removidas.

### QA-RWD-01 — Breakpoints

Executar os fluxos principais em:

- desktop: `1440 × 960`;
- tablet: `900 × 900`;
- mobile: `390 × 844`.

**Aceite:** sem overflow horizontal de página; sidebar expandida, compacta e em
drawer, respectivamente; avatar permanece circular; troca e progresso empilham
no mobile; botões principais continuam alcançáveis.

## Verificações automatizadas cobertas

`scripts/check-preview.cjs` cobre:

- assets e fonte locais;
- baseline e invariantes das 60 semanas;
- todos os meses de 2026 e travessia para 2027;
- navegação, busca, filtros, estado vazio e overflow;
- prioridade, confirmação obsoleta e antecedência positiva/negativa;
- evidência, observação, confirmação, sincronização e liberação;
- regra de semana recebida;
- desktop, tablet, mobile, contraste de controles-chave e estados semânticos,
  foco, movimento reduzido e console;
- restauração do baseline após reload e ausência de requisições externas;
- igualdade byte a byte entre o artefato local e a prévia, via
  `npm run smoke:public` após a publicação.

## Limitações deliberadas do Alpha

Não registrar como defeito isolado:

- perda de estado ao recarregar;
- ausência de login, API, banco, upload real, WhatsApp real ou multiusuário;
- ausência de perfil completo de proprietário;
- ausência de importação Excel e exportação;
- uso de nomes, unidades, pedidos e datas fictícios;
- ausência de fotografias reais;
- concentração do protótipo em `preview/index.html`.

Registrar como defeito se uma limitação for apresentada como funcionalidade
real, se houver vazamento/transmissão inesperada ou se o comportamento contradiz
o README.

## Severidade sugerida

| Severidade | Critério |
|---|---|
| Bloqueante | Aplicação não abre; perda/inversão de regra central; confirmação incorreta; dados reais transmitidos. |
| Alta | Fluxo principal não conclui; prioridade, 90 dias, estoque ou titularidade ficam incorretos. |
| Média | Função secundária quebrada, acessibilidade impeditiva ou layout inutilizável em breakpoint suportado. |
| Baixa | Texto, alinhamento ou inconsistência visual sem impedir a tarefa. |

## Formato mínimo do reporte

```text
Título:
Caso de referência:
Ambiente e viewport:
URL ou commit:
Estado inicial após reload:
Passos exatos:
Resultado observado:
Resultado esperado:
Severidade sugerida:
Captura ou vídeo:
Erros do console:
```

## Evidência da auditoria interna

Em 30/09/2026, antes do handoff:

- instalação limpa do lockfile standalone: aprovada;
- auditoria npm standalone: 0 vulnerabilidades conhecidas;
- suíte Playwright: aprovada;
- execução por `file://`: aprovada;
- prévia Vercel sem autenticação, em desktop e mobile: aprovada;
- HTML remoto idêntico ao local pelo SHA-256 documentado: aprovado;
- Git: `main` sincronizada no momento da publicação.
