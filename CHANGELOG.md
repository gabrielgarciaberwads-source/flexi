# Changelog

As mudanças relevantes do Flexi são registradas neste arquivo. O projeto segue
versionamento semântico para identificar a maturidade da demonstração, embora
não seja publicado como pacote npm.

## [1.0.0-alpha.1] — 2026-09-30

### Produto

- Dashboard Ownerinc com métricas, busca e filas operacionais.
- Calendário Ano/Mês iniciado em setembro de 2026.
- Sessenta períodos fictícios distribuídos pelos doze meses de 2026.
- Linhas de sete noites com check-in de casas na quinta e flats na sexta.
- Banco de semanas com estoque e compatibilidade por prioridade.
- Detalhe da troca com reserva, contato, evidência local, confirmação,
  observações, estado concluído e liberação manual.
- Sincronização em memória entre Dashboard, Calendário, Banco e Pedidos.
- Shell responsivo e acessível para desktop, tablet e mobile.

### Qualidade

- Repositório standalone com dependências e lockfile próprios.
- Suíte Playwright executada por `file://`.
- Cobertura de regras positivas, negativas e proteção contra confirmação
  obsoleta.
- Auditoria npm isolada do workspace pai.
- Handoff para QA externo e gate de GitHub Actions.
- Smoke pós-publicação com comparação SHA-256 do HTML local e remoto.

### Decisões posteriores ao protótipo inicial

- Removida a visualização Semana; permanecem Ano e Mês.
- Removido o explorador de ícones e movimento.
- Fixada a família Lucide para ícones operacionais.
- Definido `29/09/2026` como relógio da demonstração.

### Limitações conhecidas

- Sem backend, autenticação, autorização ou persistência.
- Sem upload e integrações reais.
- Sem concorrência, transações ou trilha de auditoria persistente.
- Proprietários e Importação Excel ainda não são módulos completos.
- Arquitetura estática concentrada em `preview/index.html`.
