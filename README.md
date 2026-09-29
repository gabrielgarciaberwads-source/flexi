# Flexi — prévia de Gestão de Troca de Semanas

Protótipo navegável para validar o calendário e o fluxo de troca com o pós-vendas.
Abra `preview/index.html` diretamente no navegador ou use o visual companion.
Não exige instalação, API, credenciais ou acesso a dados reais.

## Escopo

- Calendário por unidade, com datas reais, filtros e drawer de semana.
- Banco de semanas e pedidos com prioridade pela data do pedido original.
- Banco em calendário pesquisável: somente semanas efetivamente disponíveis,
  busca por unidade/titular de origem/código, filtros Todos/Casas/Flats e tipologia,
  navegação mensal e ampliação. Filtros independentes do calendário geral.
  O seletor **Unidade** identifica tipo e número (Casa 01, Flat 01 etc.) e combina
  com tipologia, pesquisa e mês. A lista acompanha Todos/Casas/Flats e limpa uma
  seleção incompatível ao mudar o tipo. Unidades sem estoque continuam na lista;
  selecioná-las exibe o estado vazio, sem incluir semanas indisponíveis.
  Cada bloco mostra o período e a quantidade de pedidos compatíveis; clicar abre
  o drawer com origem, histórico e fila. Reservas saem do banco, e a confirmação
  faz a origem entrar e o destino sair também nesta visualização.
- Novo pedido com semana original e alternativas exatas.
- Reserva, contato, evidência local de WhatsApp e revisão da troca.
- Confirmação simulada: semana original entra no banco e destino passa ao titular.
- Liberação manual de uma reserva vencida; pedido preserva prioridade.

Todos os nomes e registros são fictícios. O estado é mantido apenas em memória;
recarregar a página reinicia a demonstração. Arquivos selecionados não são enviados.
O relógio da demonstração é fixo em 29/09/2026 às 12h (UTC).

## Validação

### Revisão visual: leitura confortável

- Filtro de acomodação: **Todos / Casas / Flats**.
- Texto-base de 16 px, status do calendário de 16 px, linhas de 108 px e
  controles de pelo menos 44 px (navegação mensal: 42 px).
- Calendário com largura mínima de 1600 px e rolagem horizontal própria;
  unidade e cabeçalho permanecem fixos para preservar o contexto.
- Drawer de 560 px, textos e tabelas ampliados.
- **Ampliar calendário** dedica a janela à grade, filtros e navegação do período.
  Oculta sidebar, cabeçalho e indicadores, preservando filtros, período e rolagem
  interna. **Voltar à visão normal** ou Esc restaura a visão anterior. Se houver
  drawer aberto, o primeiro Esc fecha apenas o drawer. Ao navegar para outra
  tela, a navegação principal reaparece.
- **Lucide Linear é o padrão aprovado** para os ícones principais.
- Botão **Ícones e movimento** na sidebar permite comparar Phosphor Duotone
  e Lucide Linear nos quatro ícones principais. Seleção vale só nesta sessão.
- Movimento CSS: drawer 220 ms, modal/toast 180 ms, resposta de cor 140 ms.
  `prefers-reduced-motion` e desativação manual são respeitados.

Referências: [beUI](https://beui.dev/docs/motion-patterns) para princípios de
movimento e [Shadcn Dashboard](https://shadcndashboard.com/templates) para
hierarquia de painéis (sem código ou assets desses templates).
SVGs de [Lucide](https://github.com/lucide-icons/lucide) (ISC) e
[Phosphor](https://github.com/phosphor-icons/core) (MIT) incorporados localmente;
avisos de licença preservados no HTML. Nenhum pacote ou CDN é necessário.

`node scripts/check-preview.cjs` executa as verificações de interação com Playwright
disponível no workspace. Não exige servidor externo. Capturas ficam em `artifacts/`.

## Regras preservadas

Uma troca por semana original, sete noites, casas quinta–quinta e flats sexta–sexta.
Sem restrições de tipologia ou entre anos. Pedidos não disponibilizam suas origens.
Reservas vencidas ficam retidas até ação manual. Prioridade pela solicitação original.
Antecedência de 90 dias da origem verificada no contato; aceite por arquivo de WhatsApp.

## Decisões ainda abertas

- Permissão para aplicar/remover bloqueios por inadimplência.
- Confirmação se o limite de 90 dias for ultrapassado depois do contato.
- Procedimento para desfazer troca cuja origem já foi repassada.

Essas exceções não são executadas neste protótipo. Importação, login, persistência,
auditoria imutável, concorrência e transação real serão tratados na implementação.
