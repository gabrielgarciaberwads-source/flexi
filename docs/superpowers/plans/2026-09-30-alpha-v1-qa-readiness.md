# Flexi Alpha V1 QA Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o repositório standalone do Flexi em estado verificável por um QA externo, com documentação coerente, cobertura dos requisitos públicos e limites do Alpha V1 explícitos.

**Architecture:** Manter `preview/index.html` como protótipo estático e portátil por `file://`, sem introduzir framework ou backend antes da validação dos fluxos. Isolar o ambiente npm, remover resíduos de funcionalidades retiradas, ampliar a suíte Playwright e criar documentação operacional de handoff.

**Tech Stack:** HTML/CSS/JavaScript estáticos, assets Ownerinc locais, Node.js 20+, Playwright 1.63, npm, GitHub Actions e Vercel.

## Global Constraints

- O produto permanece um Alpha V1 estático, sem backend, autenticação ou persistência.
- A data fixa da demonstração continua `2026-09-29` em UTC.
- O Calendário oferece somente `year` e `month`, iniciando em setembro de 2026.
- Casas mantêm check-in na quinta; flats, na sexta; todos os períodos têm sete noites.
- Dados e comprovantes continuam somente em memória e são reiniciados no reload.
- A rodada não modulariza amplamente `preview/index.html`.
- Nenhuma alteração pode reintroduzir dependência do monorepo pai.

---

### Task 1: Isolar e versionar o projeto standalone

**Files:**
- Create: `.npmrc`
- Modify: `.gitignore`
- Delete: `preview/.gitignore`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: Node.js `>=20`, `package-lock.json` local.
- Produces: scripts `npm run verify`, `npm run audit` e `npm run qa` independentes do workspace pai.

- [ ] **Step 1: Registrar a configuração npm local**

Criar `.npmrc` com:

```ini
workspaces=false
```

- [ ] **Step 2: Consolidar arquivos ignorados**

Adicionar ao `.gitignore` raiz:

```gitignore
.vercel/
.openchamber/
playwright-report/
test-results/
```

Remover `preview/.gitignore`, pois sua única regra passa a ser coberta na raiz.

- [ ] **Step 3: Declarar o Alpha V1 e os comandos de QA**

Atualizar `package.json` e `package-lock.json` para `1.0.0-alpha.1`, declarar
`"node": ">=20"` e adicionar:

```json
"audit": "npm audit --workspaces=false",
"qa": "npm run verify && npm run audit"
```

- [ ] **Step 4: Verificar o isolamento**

Executar:

```sh
npm ci
npm audit
```

Esperado: instalação baseada no lockfile do Flexi e `found 0 vulnerabilities`,
sem pacotes do workspace pai.

---

### Task 2: Remover resíduos e identificar o Alpha na aplicação

**Files:**
- Modify: `preview/index.html`
- Test: `scripts/check-preview.cjs`

**Interfaces:**
- Consumes: fixtures `weeks`, `requests`, `DEMO_TODAY` e modos `year|month`.
- Produces: shell com identificação `Alpha V1`, data padrão `2027-01-08` para novo pedido e fonte sem controles retirados.

- [ ] **Step 1: Escrever verificações estruturais que falham no estado atual**

Adicionar à suíte leituras do HTML e asserções para rejeitar:

```js
expect(source).not.toMatch(/2027-04|openVisualExplorer|data-visual-action|motion-toggle/);
expect(source).not.toMatch(/calendarView\s*===\s*['"]week|renderWeekCalendar/);
expect(source).toContain('Alpha V1 · dados fictícios');
```

- [ ] **Step 2: Executar a suíte e confirmar a falha**

Executar `npm run verify`.

Esperado: falha pela data antiga `2027-04-16` e pela identificação ainda ser
`Prévia · dados fictícios`.

- [ ] **Step 3: Corrigir a implementação mínima**

- trocar a identificação da topbar para `Alpha V1 · dados fictícios`;
- usar `2027-01-08` diretamente no campo de primeira opção;
- remover o ajuste posterior do valor no `render()`;
- remover código e estilos mortos exclusivos de Semana/explorador visual;
- manter `prefers-reduced-motion` e os ícones Lucide usados pelo produto.

- [ ] **Step 4: Executar a suíte**

Executar `npm run verify`.

Esperado: PASS sem erro de console.

---

### Task 3: Cobrir todos os compromissos funcionais do README

**Files:**
- Modify: `scripts/check-preview.cjs`
- Modify only if a defect is exposed: `preview/index.html`

**Interfaces:**
- Consumes: funções globais do protótipo carregado por `file://`.
- Produces: uma suíte única que falha quando uma regra publicada regride.

- [ ] **Step 1: Cobrir navegação e telas auxiliares**

Adicionar testes para:

```text
Dashboard → Banco
Dashboard → Pedidos (atendimento e sem atendimento)
Proprietários → drawer de semanas
Novo pedido → adicionar/remover alternativa
```

- [ ] **Step 2: Cobrir Calendário e Banco**

Adicionar testes para busca, filtros, estado vazio, persistência Ano/Mês,
overflow `+N itens`, abertura do drawer e filtros de unidade/tipologia no Banco.

- [ ] **Step 3: Cobrir prioridade e validações negativas**

Adicionar fixtures temporárias em memória para provar:

```js
compatible(target)[0].id === 'TR-0087'
contactIssue(request, origin, target) rejeita origem com menos de 90 dias
confirmationMatches(...) rejeita estado alterado após abertura do modal
```

- [ ] **Step 4: Cobrir sincronização pós-confirmação**

Depois de concluir `TR-0087`, verificar pela interface:

```text
Dashboard: contagens atualizadas
Calendário: origem disponível e destino em uso
Banco: origem presente e destino ausente
Pedidos: TR-0087 concluído
Novo pedido: semana recebida ausente das origens elegíveis
```

- [ ] **Step 5: Cobrir acessibilidade e layouts**

Validar desktop `1440x960`, tablet `900x900` e mobile `390x844`, incluindo
foco, `Escape`, trap de modal/menu, avatar 1:1, contraste, movimento reduzido,
console e ausência de overflow de página.

- [ ] **Step 6: Executar a suíte completa**

Executar `npm run verify`.

Esperado: PASS com capturas em `artifacts/`.

---

### Task 4: Documentar arquitetura, Alpha V1 e handoff

**Files:**
- Modify: `README.md`
- Create: `docs/QA-HANDOFF.md`
- Modify: `docs/superpowers/plans/2026-09-29-ownerinc-core-uiux.md`
- Create: `CHANGELOG.md`

**Interfaces:**
- Consumes: comportamento confirmado pela Task 3.
- Produces: documentação pública sem afirmações não testadas.

- [ ] **Step 1: Reestruturar o README**

Adicionar seções explícitas:

```text
Status: Alpha V1
Por que é Alpha
O que está implementado
Arquitetura e estrutura do repositório
Dados e regras
Como executar
Como validar
Limitações conhecidas
Critérios para sair do Alpha
```

- [ ] **Step 2: Criar o handoff de QA**

Documentar baseline `15/1/2/60`, casos manuais, breakpoints, severidades,
modelo de bug, limitações deliberadas e URL pública.

- [ ] **Step 3: Arquivar corretamente o plano antigo**

Adicionar no topo do plano de 29/09/2026 um aviso de documento histórico,
indicando que Semana e o explorador visual foram removidos posteriormente.

- [ ] **Step 4: Registrar a revisão**

Criar `CHANGELOG.md` com a entrada `1.0.0-alpha.1`, data `2026-09-30`, escopo
funcional e limitações conhecidas.

- [ ] **Step 5: Conferir contradições**

Executar buscas por datas antigas, combinações de modos removidos, marcadores
de pendência e `Ícones e movimento`. Nenhuma ocorrência contraditória pode
permanecer em documentação corrente ou código de produto.

---

### Task 5: Automatizar o gate e fechar a auditoria

**Files:**
- Create: `.github/workflows/qa.yml`
- Modify: `docs/QA-HANDOFF.md` somente para registrar o resultado final

**Interfaces:**
- Consumes: scripts npm das Tasks 1 e 3.
- Produces: gate reproduzível no GitHub e evidência final local/remota.

- [ ] **Step 1: Criar o workflow**

Configurar Ubuntu, Node.js 20, `npm ci`, instalação do Chromium Playwright,
`npm run verify` e `npm run audit` para pushes e pull requests de `main`.

- [ ] **Step 2: Executar instalação limpa e QA local**

Executar:

```sh
npm ci
npx playwright install chromium
npm run qa
git diff --check
```

Esperado: todos os comandos passam.

- [ ] **Step 3: Inspecionar a aplicação**

Abrir a aplicação em desktop e mobile, verificar Dashboard, Calendário Mês/Ano,
drawer e Detalhe da troca. Confirmar ausência de clipping, controles removidos
ou erros no console.

- [ ] **Step 4: Commitar e publicar**

```sh
git add .
git commit -m "chore: prepare Alpha V1 for external QA"
git push origin main
```

- [ ] **Step 5: Atualizar e validar a prévia pública**

Publicar `preview/` na Vercel e confirmar HTTP 200 em
`https://preview-steel-beta.vercel.app`, título correto e controles Ano/Mês.

- [ ] **Step 6: Confirmar estado final**

Executar `git status -sb` e comparar `HEAD` com `origin/main`.

Esperado: árvore limpa e commits idênticos.
