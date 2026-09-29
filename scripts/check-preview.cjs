const { chromium, expect } = require('@playwright/test');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const artifacts = path.join(__dirname, '..', 'artifacts');
  fs.mkdirSync(artifacts, { recursive: true });
  try {
    await page.goto(pathToFileURL(path.join(__dirname, '..', 'preview', 'index.html')).href);
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await expect(page.locator('[data-nav="dashboard"]')).toHaveAttribute('aria-current', 'page');
    await expect(page.getByText('Flexi · Gestão de trocas', { exact: true })).toBeVisible();
    await expect(page.locator('.brand-logo')).toHaveAttribute('alt', 'Ownerinc');
    expect(await page.locator('.brand-logo').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    expect(await page.evaluate(async () => { await document.fonts.ready; return document.fonts.check('16px Novelin'); })).toBe(true);
    await expect(page.locator('[data-dashboard-metric="available"]')).toHaveText('15');
    await expect(page.locator('[data-dashboard-metric="service"]')).toHaveText('3');
    await expect(page.locator('[data-dashboard-metric="unattended"]')).toHaveText('2');
    await expect(page.locator('[data-dashboard-metric="total"]')).toHaveText('60');
    await page.getByLabel('Buscar no painel').fill('João Pedro');
    await expect(page.locator('#dashboard-available .dashboard-row')).toHaveCount(1);
    await expect(page.locator('#dashboard-service .dashboard-row')).toHaveCount(1);
    await expect(page.locator('#dashboard-unattended .dashboard-row')).toHaveCount(1);
    await page.getByLabel('Buscar no painel').fill('sem-223');
    await expect(page.locator('#dashboard-available .dashboard-row')).toHaveCount(1);
    await expect(page.locator('#dashboard-service .dashboard-row')).toHaveCount(0);
    await expect(page.locator('#dashboard-unattended .dashboard-row')).toHaveCount(0);
    await page.locator('#dashboard-available .dashboard-row').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByLabel('Buscar no painel').fill('TR-0087');
    await page.locator('#dashboard-service .dashboard-row').click();
    await expect(page.getByRole('heading', { name: 'Detalhe da troca', exact: true })).toBeVisible();
    await expect(page.getByLabel('Metadados da troca')).toContainText('TR-0087');
    await expect(page.locator('.exchange-stage')).toHaveCount(4);
    await expect(page.locator('.exchange-stage strong')).toHaveText(['Pedido criado', 'Opção reservada', 'Aceite validado', 'Troca concluída']);
    expect(await page.locator('.exchange-panels').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(3);
    await page.getByRole('button', { name: 'Voltar ao Dashboard' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await page.locator('#dashboard-available .dashboard-panel-foot [data-nav="bank"]').click();
    await expect(page.getByRole('heading', { name: 'Banco de semanas', exact: true })).toBeVisible();
    await page.locator('#nav [data-nav="dashboard"]').click();
    await page.locator('#dashboard-service .dashboard-panel-foot [data-nav="requests"]').click();
    await expect(page.getByRole('heading', { name: 'Pedidos de troca', exact: true })).toBeVisible();
    await page.locator('[data-nav="dashboard"]').click();
    await page.locator('#dashboard-unattended .dashboard-panel-foot [data-nav="requests"]').click();
    await expect(page.getByRole('heading', { name: 'Pedidos de troca', exact: true })).toBeVisible();
    await page.locator('[data-nav="owners"]').click();
    await expect(page.getByRole('heading', { name: 'Proprietários', exact: true })).toBeVisible();
    await page.locator('[data-nav="dashboard"]').click();
    await page.getByRole('button', { name: 'Novo pedido de troca' }).click();
    await expect(page.getByRole('heading', { name: 'Novo pedido de troca', exact: true })).toBeVisible();
    await page.locator('[data-nav="dashboard"]').click();
    await page.locator('[data-nav="calendar"]').click();
    await expect(page.getByRole('heading', { name: 'Calendário de semanas' })).toBeVisible();
    await expect(page.locator('.operational-calendar')).toHaveAttribute('data-calendar-view', 'month');
    await expect(page.locator('button[data-calendar-view="month"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-calendar-render="month"]')).toBeVisible();
    await expect(page.locator('#calendar-period-title')).toHaveText('abril de 2027');
    await expect(page.locator('#visible-count')).toHaveText('60 semanas neste período');
    expect(await page.evaluate(() => calendarDate)).toBe('2027-04-15');
    await expect(page.locator('.month-weekdays span')).toHaveText(['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']);
    await expect(page.locator('#kind-filter option')).toHaveText(['Todos', 'Casas', 'Flats']);

    // Segmented controls retain the exact context date and restore focus.
    await page.locator('button[data-calendar-view="year"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.operational-calendar')).toHaveAttribute('data-calendar-view', 'year');
    await expect(page.locator('button[data-calendar-view="year"]')).toBeFocused();
    expect(await page.evaluate(() => calendarDate)).toBe('2027-04-15');

    // Year navigation preserves month/day, Today uses the fixed demo date, and empty years remain navigable.
    await page.getByRole('button', { name: 'Ano anterior' }).click();
    await expect(page.locator('#calendar-period-title')).toHaveText('2026');
    expect(await page.evaluate(() => calendarDate)).toBe('2026-04-15');
    await expect(page.locator('.mini-month')).toHaveCount(12);
    await expect(page.locator('.calendar-empty-state')).toBeVisible();
    await page.getByRole('button', { name: 'Hoje', exact: true }).click();
    expect(await page.evaluate(() => calendarDate)).toBe('2026-09-29');
    await expect(page.locator('.mini-month')).toHaveCount(12);
    await page.getByRole('button', { name: 'Próximo ano' }).click();
    await expect(page.locator('#calendar-period-title')).toHaveText('2027');
    expect(await page.evaluate(() => calendarDate)).toBe('2027-09-29');

    await page.evaluate(() => { calendarDate = '2027-04-15'; renderOperationalGrid(); });
    await page.locator('button[data-calendar-view="month"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('button[data-calendar-view="month"]')).toBeFocused();
    expect(await page.evaluate(() => calendarDate)).toBe('2027-04-15');
    await page.locator('button[data-calendar-view="week"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('button[data-calendar-view="week"]')).toBeFocused();
    expect(await page.evaluate(() => calendarDate)).toBe('2027-04-15');

    // Week groups records on their check-in date and keeps each exact seven-night period.
    await expect(page.locator('[data-calendar-render="week"]')).toBeVisible();
    await expect(page.locator('.week-day')).toHaveCount(7);
    const houseCheckinDay = page.locator('.week-day').filter({ has: page.locator('[data-week="SEM-183"]') });
    await expect(houseCheckinDay.locator('.week-day-header strong')).toHaveText('qui');
    await expect(houseCheckinDay.locator('.week-day-header span')).toHaveText('15 de abr');
    await expect(houseCheckinDay.locator('[data-week="SEM-183"]')).toContainText('15 de abr — 22 de abr 2027');
    const flatCheckinDay = page.locator('.week-day').filter({ has: page.locator('[data-week="SEM-223"]') });
    await expect(flatCheckinDay.locator('.week-day-header strong')).toHaveText('sex');
    await expect(flatCheckinDay.locator('.week-day-header span')).toHaveText('16 de abr');
    await expect(flatCheckinDay.locator('[data-week="SEM-223"]')).toContainText('16 de abr — 23 de abr 2027');

    // Week previous/Today/next navigation keeps all seven days even with no records.
    await page.getByRole('button', { name: 'Semana anterior' }).click();
    await expect(page.locator('#calendar-period-title')).toHaveText('5 — 11 abr 2027');
    expect(await page.evaluate(() => calendarDate)).toBe('2027-04-08');
    await page.getByRole('button', { name: 'Hoje', exact: true }).click();
    await expect(page.locator('#calendar-period-title')).toHaveText('28 set — 4 out 2026');
    expect(await page.evaluate(() => calendarDate)).toBe('2026-09-29');
    await expect(page.locator('.week-day')).toHaveCount(7);
    await expect(page.locator('.calendar-empty-state')).toBeVisible();
    await page.getByRole('button', { name: 'Próxima semana' }).click();
    await expect(page.locator('#calendar-period-title')).toHaveText('5 — 11 out 2026');
    expect(await page.evaluate(() => calendarDate)).toBe('2026-10-06');
    await expect(page.locator('.week-day')).toHaveCount(7);

    // Keyboard drill-down moves focus to an accessible contextual title.
    await page.evaluate(() => { calendarDate = '2027-04-15'; calendarView = 'year'; renderOperationalGrid(); });
    await page.locator('.mini-month-header').nth(3).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.operational-calendar')).toHaveAttribute('data-calendar-view', 'month');
    expect(await page.evaluate(() => calendarDate)).toBe('2027-04-01');
    await expect(page.locator('#calendar-period-title')).toBeFocused();
    await page.locator('button[data-calendar-view="year"]').click();
    await page.locator('[data-calendar-date="2027-04-15"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.operational-calendar')).toHaveAttribute('data-calendar-view', 'week');
    expect(await page.evaluate(() => calendarDate)).toBe('2027-04-15');
    await expect(page.locator('#calendar-period-title')).toBeFocused();
    await page.locator('button[data-calendar-view="month"]').click();

    // A Thursday-to-Thursday item is split 4 + 3 days, with an exclusive checkout boundary.
    const splitWeek = page.locator('.month-event[data-week="SEM-181"]');
    await expect(splitWeek).toHaveCount(2);
    await expect(splitWeek.nth(0)).toHaveClass(/continues-after/);
    await expect(splitWeek.nth(0)).not.toHaveClass(/continues-before/);
    await expect(splitWeek.nth(0)).toHaveAttribute('data-period-start', '2027-04-01');
    await expect(splitWeek.nth(0)).toHaveAttribute('data-period-end', '2027-04-08');
    await expect(splitWeek.nth(0)).toHaveAttribute('data-segment-start', '2027-04-01');
    await expect(splitWeek.nth(0)).toHaveAttribute('data-segment-end', '2027-04-05');
    await expect(splitWeek.nth(1)).toHaveClass(/continues-before/);
    await expect(splitWeek.nth(1)).not.toHaveClass(/continues-after/);
    await expect(splitWeek.nth(1)).toHaveAttribute('data-segment-start', '2027-04-05');
    await expect(splitWeek.nth(1)).toHaveAttribute('data-segment-end', '2027-04-08');
    await expect(splitWeek.nth(0)).toHaveAttribute('title', /01 de abr — 08 de abr 2027/);
    expect(await splitWeek.evaluateAll(segments => segments.reduce((total, segment) => total + (Date.parse(`${segment.dataset.segmentEnd}T12:00:00Z`) - Date.parse(`${segment.dataset.segmentStart}T12:00:00Z`)) / 86400000, 0))).toBe(7);

    // Overflow count and ordering are deterministic and survive a mode rerender.
    await expect(page.locator('.month-overflow')).toHaveText(['+9 itens', '+21 itens', '+21 itens', '+21 itens', '+21 itens']);
    const expectedOverflowOrder = ['SEM-196', 'SEM-201', 'SEM-206', 'SEM-211', 'SEM-216', 'SEM-221', 'SEM-226', 'SEM-231', 'SEM-236'];
    await page.locator('.month-overflow').first().click();
    expect(await page.locator('.calendar-overflow-item').evaluateAll(items => items.map(item => item.dataset.week))).toEqual(expectedOverflowOrder);
    await page.keyboard.press('Escape');
    await page.locator('button[data-calendar-view="year"]').click();
    await page.locator('button[data-calendar-view="month"]').click();
    await expect(page.locator('.month-overflow').first()).toHaveText('+9 itens');
    await page.locator('.month-overflow').first().click();
    expect(await page.locator('.calendar-overflow-item').evaluateAll(items => items.map(item => item.dataset.week))).toEqual(expectedOverflowOrder);
    await page.locator('.calendar-overflow-item').first().click();
    await expect(page.getByRole('dialog')).toContainText(/7 noites/);
    await page.keyboard.press('Escape');
    await page.locator('.month-event').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');

    // Filters survive all modes; their empty message coexists with each navigable calendar structure.
    await page.getByLabel('Tipo de acomodação').selectOption({ label: 'Casas' });
    await expect(page.locator('#visible-count')).toHaveText('40 semanas neste período');
    await page.getByLabel('Tipologia', { exact: true }).selectOption('B');
    await expect(page.locator('#visible-count')).toHaveText('15 semanas neste período');
    await page.getByLabel('Situação', { exact: true }).selectOption('available');
    await page.getByLabel('Buscar unidade, titular ou semana').fill('Casa');
    await page.locator('button[data-calendar-view="year"]').click();
    await expect(page.locator('[data-calendar-render="year"]')).toBeVisible();
    await expect(page.locator('.mini-month')).toHaveCount(12);
    await expect(page.getByLabel('Tipo de acomodação')).toHaveValue('Casa');
    await expect(page.getByLabel('Tipologia', { exact: true })).toHaveValue('B');
    await expect(page.getByLabel('Situação', { exact: true })).toHaveValue('available');
    await expect(page.getByLabel('Buscar unidade, titular ou semana')).toHaveValue('Casa');
    await page.getByLabel('Buscar unidade, titular ou semana').fill('impossivel');
    await expect(page.getByText('Nenhuma semana corresponde aos filtros neste período.')).toBeVisible();
    await expect(page.locator('.mini-month')).toHaveCount(12);
    await page.locator('button[data-calendar-view="month"]').click();
    await expect(page.locator('.calendar-empty-state')).toBeVisible();
    await expect(page.locator('[data-calendar-render="month"]')).toBeVisible();
    await expect(page.locator('.month-week')).toHaveCount(5);
    await page.locator('button[data-calendar-view="week"]').click();
    await expect(page.locator('.calendar-empty-state')).toBeVisible();
    await expect(page.locator('[data-calendar-render="week"]')).toBeVisible();
    await expect(page.locator('.week-day')).toHaveCount(7);
    await expect(page.getByLabel('Tipo de acomodação')).toHaveValue('Casa');
    await expect(page.getByLabel('Tipologia', { exact: true })).toHaveValue('B');
    await expect(page.getByLabel('Situação', { exact: true })).toHaveValue('available');
    await expect(page.getByLabel('Buscar unidade, titular ou semana')).toHaveValue('impossivel');
    await page.getByLabel('Buscar unidade, titular ou semana').fill('');
    await page.getByLabel('Tipo de acomodação').selectOption('');
    await page.getByLabel('Tipologia', { exact: true }).selectOption('');
    await page.getByLabel('Situação', { exact: true }).selectOption('');
    await page.locator('button[data-calendar-view="year"]').click();
    await expect(page.locator('#visible-count')).toHaveText('60 semanas neste período');
    await page.screenshot({ path: path.join(artifacts, 'calendar-year.png'), fullPage: true, animations: 'disabled' });
    await page.locator('[data-calendar-date="2027-04-15"]').click();
    await page.screenshot({ path: path.join(artifacts, 'calendar-week.png'), fullPage: true, animations: 'disabled' });
    await page.locator('button[data-calendar-view="month"]').click();
    await page.getByRole('button', { name: 'Mês anterior' }).click();
    await expect(page.locator('#calendar-period-title')).toHaveText('março de 2027');
    await expect(page.getByText('Nenhuma semana corresponde aos filtros neste período.')).toBeVisible();
    await expect(page.locator('[data-calendar-render="month"]')).toBeVisible();
    await expect(page.locator('.month-event')).toHaveCount(0);
    await page.getByRole('button', { name: 'Próximo mês' }).click();
    await expect(page.locator('#calendar-period-title')).toHaveText('abril de 2027');
    await page.getByRole('button', { name: 'Hoje', exact: true }).click();
    await expect(page.locator('#calendar-period-title')).toHaveText('setembro de 2026');
    await expect(page.locator('[data-calendar-render="month"]')).toBeVisible();
    await page.evaluate(() => { calendarDate = '2027-04-15'; renderOperationalGrid(); });
    await page.locator('[data-calendar-date="2027-04-22"]').click();
    await expect(page.locator('.operational-calendar')).toHaveAttribute('data-calendar-view', 'week');
    await expect(page.locator('#calendar-period-title')).toBeFocused();
    await page.locator('[data-week="SEM-189"]').click();
    await page.getByRole('button', { name: 'Abrir pedido' }).click();
    await expect(page.getByRole('heading', { name: 'Detalhe da troca', exact: true })).toBeVisible();
    await expect(page.getByLabel('Metadados da troca')).toContainText('TR-0082');
    await page.getByRole('button', { name: 'Voltar ao Calendário' }).click();
    await expect(page.getByRole('heading', { name: 'Calendário de semanas' })).toBeVisible();
    await page.locator('button[data-calendar-view="month"]').click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.locator('#nav .duotone')).toHaveCount(0);
    await page.getByLabel('Tipo de acomodação').selectOption({ label: 'Casas' });
    await page.getByRole('button', { name: 'Ampliar calendário' }).click();
    await expect(page.locator('.sidebar')).toBeHidden();
    await expect(page.locator('.summary')).toBeHidden();
    await expect(page.locator('#kind-filter')).toHaveValue('Casa');
    await expect(page.locator('.operational-calendar')).toHaveAttribute('data-calendar-view', 'month');
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight)).toBe(true);
    await page.screenshot({ path: path.join(artifacts, 'calendar-focused.png'), animations: 'disabled' });
    await page.locator('.month-event').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('.sidebar')).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(page.locator('#kind-filter')).toHaveValue('Casa');
    await page.getByLabel('Tipo de acomodação').selectOption('');
    await page.getByRole('button', { name: 'Explorar ícones e movimento' }).click();
    await page.getByRole('button', { name: 'Experimentar Phosphor · Duotone' }).click();
    await expect(page.locator('#nav .duotone')).toHaveCount(5);
    await page.getByRole('button', { name: 'Experimentar Lucide · Linear' }).click();
    await expect(page.locator('#nav .duotone')).toHaveCount(0);
    await page.screenshot({ path: path.join(artifacts, 'visual-explorer.png'), animations: 'disabled' });
    await page.getByLabel('Ativar animações curtas').uncheck();
    await expect(page.locator('.drawer')).toHaveCSS('animation-name', 'none');
    await page.getByLabel('Ativar animações curtas').check();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.drawer')).toHaveCSS('animation-name', 'none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.keyboard.press('Escape');
    await page.screenshot({ path: path.join(artifacts, 'calendar.png'), fullPage: true });
    await page.getByLabel('Situação', { exact: true }).selectOption('blocked');
    await page.locator('[data-nav="bank"]').first().click();
    await expect(page.getByRole('heading', { name: 'Banco de semanas', exact: true })).toBeVisible();
    await expect(page.locator('.week')).toHaveCount(15);
    await expect(page.locator('.week:not(.available)')).toHaveCount(0);
    await expect(page.locator('#unit-filter option')).toHaveCount(13);
    await page.getByLabel('Unidade', { exact: true }).selectOption({ label: 'Casa 01' });
    await expect(page.locator('.unit strong')).toHaveText(['Casa 01']);
    await expect(page.locator('.week')).toHaveCount(1);
    await page.getByLabel('Tipo de acomodação').selectOption({ label: 'Flats' });
    await expect(page.getByLabel('Unidade', { exact: true })).toHaveValue('');
    await expect(page.locator('#unit-filter option')).toHaveText(['Todas as unidades', 'Flat 01', 'Flat 02', 'Flat 03', 'Flat 04']);
    await page.getByLabel('Unidade', { exact: true }).selectOption({ label: 'Flat 01' });
    await expect(page.locator('.unit strong')).toHaveText(['Flat 01']);
    await expect(page.locator('.week')).toHaveCount(2);
    await page.locator('[data-nav="calendar"]').first().click();
    await page.locator('[data-nav="bank"]').first().click();
    await expect(page.getByLabel('Unidade', { exact: true })).toHaveValue('9');
    await page.getByLabel('Tipo de acomodação').selectOption({ label: 'Casas' });
    await expect(page.locator('#unit-filter option')).toHaveCount(9);
    await expect(page.getByLabel('Unidade', { exact: true })).toHaveValue('');
    await page.getByLabel('Unidade', { exact: true }).selectOption({ label: 'Casa 02' });
    await expect(page.getByText('Nenhuma semana corresponde aos filtros.')).toBeVisible();
    await page.getByLabel('Unidade', { exact: true }).selectOption('');
    await page.getByLabel('Tipo de acomodação').selectOption('');
    await page.getByLabel('Buscar unidade ou titular de origem').fill('Bruno');
    await expect(page.locator('.week')).toHaveCount(2);
    await page.getByLabel('Tipologia', { exact: true }).selectOption('A');
    await expect(page.getByText('Nenhuma semana corresponde aos filtros.')).toBeVisible();
    await page.getByLabel('Tipologia', { exact: true }).selectOption('');
    await page.getByLabel('Tipo de acomodação').selectOption({ label: 'Casas' });
    await expect(page.locator('.week')).toHaveCount(0);
    await page.getByLabel('Tipo de acomodação').selectOption({ label: 'Flats' });
    await expect(page.locator('.week')).toHaveCount(2);
    await page.locator('[data-week="SEM-223"]').click();
    await expect(page.getByRole('heading', { name: 'Pedidos compatíveis (2)' })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByLabel('Buscar unidade ou titular de origem').fill('');
    await page.getByLabel('Tipo de acomodação').selectOption('');
    await page.getByRole('button', { name: 'Mês anterior' }).click();
    await expect(page.locator('.week')).toHaveCount(0);
    await page.getByRole('button', { name: 'Próximo mês' }).click();
    await expect(page.locator('.week')).toHaveCount(15);
    await page.getByRole('button', { name: 'Ampliar calendário' }).click();
    await expect(page.locator('.calendar-focus-title')).toHaveText('Banco de semanas');
    await expect(page.locator('.sidebar')).toBeHidden();
    await page.screenshot({ path: path.join(artifacts, 'bank-calendar.png'), animations: 'disabled' });
    await page.keyboard.press('Escape');
    await page.locator('[data-nav="calendar"]').first().click();
    await expect(page.getByLabel('Situação', { exact: true })).toHaveValue('blocked');
    await page.getByLabel('Situação', { exact: true }).selectOption('');
    await page.locator('[data-nav="requests"]').first().click();

    // Domain invariants: seven nights, accommodation check-in weekday, and one active request per origin.
    const domainRules = await page.evaluate(() => ({
      sevenNights: weeks.every(w => (date(w.end) - date(w.start)) / 86400000 === 7),
      checkinWeekday: weeks.every(w => date(w.start).getUTCDay() === (getUnit(w).kind === 'Casa' ? 4 : 5)),
      uniqueActiveOrigins: (() => { const ids = requests.filter(r => r.status !== 'Concluído').map(r => r.origin); return new Set(ids).size === ids.length; })(),
      singleMutationPath: [typeof renderNegotiation,typeof reserve,typeof release,typeof review].every(value=>value==='undefined')
    }));
    expect(domainRules).toEqual({ sevenNights: true, checkinWeekday: true, uniqueActiveOrigins: true, singleMutationPath: true });

    // Options are sorted by request rank first, then deterministically by date/unit/code.
    const priorityFixture = await page.evaluate(() => {
      const request = requests.find(r => r.id === 'TR-0088'),candidateStart='2027-04-23';
      const candidates=weeks.filter(w=>w.start===candidateStart).sort((a,b)=>a.unit-b.unit||a.id.localeCompare(b.id));
      const saved=candidates.map(w=>({id:w.id,state:w.state,original:w.original})),desired=[...request.desired];
      candidates.forEach(w=>{w.state='use'});candidates.slice(0,2).forEach(w=>{w.state='available';w.original=false});
      request.desired=[...desired,candidateStart];renderRequests();
      return {saved,desired,expected:[...candidates.slice(0,2).map(w=>w.id),target.id]};
    });
    await page.locator('[data-request="TR-0088"]').click();
    await expect(page.locator('.exchange-option-rank')).toHaveText(['1º', '1º', '2º']);
    expect(await page.locator('.exchange-option').evaluateAll(items => items.map(item => item.dataset.optionWeek))).toEqual(priorityFixture.expected);
    await expect(page.locator('.exchange-option').last().getByRole('button', { name: 'Reservar', exact: true })).toBeDisabled();
    await page.evaluate(fixture=>{
      const request=requests.find(r=>r.id==='TR-0088');request.desired=fixture.desired;
      fixture.saved.forEach(saved=>{const week=getWeek(saved.id);week.state=saved.state;week.original=saved.original});renderExchangeDetail();
    },priorityFixture);
    await expect(page.locator('.exchange-option-rank')).toHaveText('2º');
    await page.getByRole('button', { name: 'Voltar aos Pedidos' }).click();

    // Observations are recorded in memory with author and the fixed demonstration date.
    await page.locator('[data-request="TR-0087"]').click();
    await page.getByRole('button', { name: 'Adicionar observação' }).click();
    await page.getByRole('textbox', { name: 'Observação', exact: true }).fill('Titular prefere contato no período da tarde.');
    await page.getByRole('dialog').getByRole('button', { name: 'Adicionar observação', exact: true }).click();
    await expect(page.locator('.observation-item')).toContainText('Paula Silva');
    await expect(page.locator('.observation-item')).toContainText('29/09/2026');
    await expect(page.locator('.observation-item')).toContainText('Titular prefere contato no período da tarde.');

    // A stale reservation dialog cannot reserve a target whose state changed after opening.
    await page.getByRole('button', { name: 'Reservar', exact: true }).click();
    expect(await page.evaluate(() => requests.find(r => r.id === 'TR-0087').target)).toBeNull();
    await page.evaluate(()=>{target.state='use'});
    await page.getByRole('dialog').getByRole('button', { name: 'Confirmar reserva' }).click();
    await expect(page.getByText('As condições exibidas mudaram. O detalhe foi atualizado; revise antes de confirmar.')).toBeVisible();
    expect(await page.evaluate(() => ({target:requests.find(r=>r.id==='TR-0087').target,state:target.state}))).toEqual({target:null,state:'use'});
    await page.evaluate(()=>{target.state='available';renderExchangeDetail()});

    // Priority is recomputed at confirmation, not trusted from the opened dialog.
    await page.getByRole('button', { name: 'Reservar', exact: true }).click();
    await page.evaluate(()=>{requests.push({id:'TR-0001',owner:'Concorrente',origin:'fixture',desired:[target.start],created:'2026-09-01',status:'Aberto',target:null,contact:false,evidence:''})});
    await page.getByRole('dialog').getByRole('button', { name: 'Confirmar reserva' }).click();
    await expect(page.getByText('A prioridade do pedido mudou para esta opção.')).toBeVisible();
    expect(await page.evaluate(() => requests.find(r => r.id === 'TR-0087').target)).toBeNull();
    await page.evaluate(()=>{requests=requests.filter(r=>r.id!=='TR-0001');renderExchangeDetail()});

    // A current reservation succeeds and leaves the origin with its owner.
    await page.getByRole('button', { name: 'Reservar', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirmar reserva' }).click();
    const reservedState = await page.evaluate(() => {
      const request = requests.find(r => r.id === 'TR-0087');
      return { request, origin: getWeek(request.origin), target: getWeek(request.target) };
    });
    expect(reservedState.request.status).toBe('Em negociação');
    expect(reservedState.origin.state).toBe('waiting');
    expect(reservedState.origin.owner).toBe('João Pedro');
    expect(reservedState.target.state).toBe('reserved');
    await expect(page.locator('.destination-panel')).toContainText(reservedState.target.id);
    await expect(page.getByRole('button', { name: 'Revisar e confirmar' })).toBeDisabled();

    // Reservation is synchronized with Dashboard, Calendar, Bank, and Requests.
    await page.locator('[data-nav="dashboard"]').click();
    await expect(page.locator('[data-dashboard-metric="available"]')).toHaveText('14');
    await expect(page.locator('[data-dashboard-metric="unattended"]')).toHaveText('1');
    await page.locator('[data-nav="calendar"]').click();
    await page.evaluate(start => { calendarDate = start; calendarView = 'week'; renderOperationalGrid(); }, reservedState.target.start);
    await expect(page.locator(`.week-item[data-week="${reservedState.target.id}"]`)).toHaveClass(/reserved/);
    await page.evaluate(start => { calendarDate = start; renderOperationalGrid(); }, reservedState.origin.start);
    await expect(page.locator(`.week-item[data-week="${reservedState.origin.id}"]`)).toHaveClass(/waiting/);
    await page.locator('[data-nav="bank"]').click();
    await expect(page.locator(`[data-week="${reservedState.target.id}"]`)).toHaveCount(0);
    await page.locator('[data-nav="requests"]').click();
    await expect(page.locator('tr').filter({ has: page.locator('[data-request="TR-0087"]') })).toContainText('Em negociação');
    await page.locator('[data-request="TR-0087"]').click();

    // The 90-day check rejects a short lead time, then accepts the restored valid origin.
    const originalPeriod = await page.evaluate(() => {
      const request = requests.find(r => r.id === 'TR-0087'), week = getWeek(request.origin);
      const period = { start: week.start, end: week.end };
      week.start = '2026-11-05'; week.end = '2026-11-12'; renderExchangeDetail();
      return period;
    });
    await page.getByRole('button', { name: 'Registrar contato e verificar 90 dias' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirmar contato' }).click();
    await expect(page.getByText('A semana original não atende à antecedência de 90 dias.')).toBeVisible();
    expect(await page.evaluate(() => requests.find(r => r.id === 'TR-0087').contact)).toBe(false);
    await page.evaluate(period => {
      const request = requests.find(r => r.id === 'TR-0087'), week = getWeek(request.origin);
      week.start = period.start; week.end = period.end; renderExchangeDetail();
    }, originalPeriod);

    // A contact dialog cannot commit after request status/expiration changes.
    await page.getByRole('button', { name: 'Registrar contato e verificar 90 dias' }).click();
    await page.evaluate(()=>{const request=requests.find(r=>r.id==='TR-0087');request.status='Prazo vencido';request.expired=true});
    await page.getByRole('dialog').getByRole('button', { name: 'Confirmar contato' }).click();
    await expect(page.getByText('As condições exibidas mudaram. O detalhe foi atualizado; revise antes de confirmar.')).toBeVisible();
    expect(await page.evaluate(() => requests.find(r => r.id === 'TR-0087').contact)).toBe(false);
    await page.evaluate(()=>{const request=requests.find(r=>r.id==='TR-0087');request.status='Em negociação';request.expired=false;renderExchangeDetail()});

    await page.getByRole('button', { name: 'Registrar contato e verificar 90 dias' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirmar contato' }).click();
    expect(await page.evaluate(() => requests.find(r => r.id === 'TR-0087').contact)).toBe(true);

    // WhatsApp evidence remains local and accepts only the documented file types.
    await page.getByLabel('Anexar aceite de WhatsApp').setInputFiles({ name: 'aceite.txt', mimeType: 'text/plain', buffer: Buffer.from('invalid') });
    await expect(page.getByText('Selecione uma imagem PNG, JPEG, WebP ou um PDF.')).toBeVisible();
    expect(await page.evaluate(() => requests.find(r => r.id === 'TR-0087').evidence)).toBe('');
    await expect(page.getByRole('button', { name: 'Revisar e confirmar' })).toBeDisabled();
    await page.getByLabel('Anexar aceite de WhatsApp').setInputFiles({ name: 'aceite-demo.png', mimeType: 'image/png', buffer: Buffer.from('preview-only') });
    await expect(page.locator('.exchange-stage').nth(2)).toHaveClass(/completed/);
    await expect(page.getByRole('button', { name: 'Revisar e confirmar' })).toBeEnabled();
    expect(await page.evaluate(() => { const r=requests.find(item=>item.id==='TR-0087');return {evidence:r.evidence,evidenceAt:r.evidenceAt,evidenceType:r.evidenceType,evidenceHistory:r.history.filter(item=>item.kind==='evidence').length} })).toEqual({evidence:'aceite-demo.png',evidenceAt:'2026-09-29',evidenceType:'image/png',evidenceHistory:1});

    // Valid → invalid fully invalidates evidence, progress, history, and review eligibility.
    await page.getByLabel('Anexar aceite de WhatsApp').setInputFiles({ name: 'aceite-invalido.txt', mimeType: 'text/plain', buffer: Buffer.from('invalid-again') });
    await expect(page.locator('.exchange-stage').nth(2)).not.toHaveClass(/completed/);
    await expect(page.locator('.exchange-stage').nth(2)).toContainText('Pendente');
    await expect(page.getByRole('button', { name: 'Revisar e confirmar' })).toBeDisabled();
    expect(await page.evaluate(() => { const r=requests.find(item=>item.id==='TR-0087');return {evidence:r.evidence,evidenceAt:r.evidenceAt,evidenceType:r.evidenceType,evidenceHistory:r.history.filter(item=>item.kind==='evidence'||String(item.text).startsWith('Aceite de WhatsApp validado localmente:')).length} })).toEqual({evidence:'',evidenceAt:'',evidenceType:'',evidenceHistory:0});
    await expect(page.locator('.request-timeline')).not.toContainText('Aceite de WhatsApp validado localmente');

    // Invalid → valid restores one coherent evidence record.
    await page.getByLabel('Anexar aceite de WhatsApp').setInputFiles({ name: 'aceite-demo.png', mimeType: 'image/png', buffer: Buffer.from('preview-only') });
    await expect(page.locator('.exchange-stage').nth(2)).toHaveClass(/completed/);
    await expect(page.getByRole('button', { name: 'Revisar e confirmar' })).toBeEnabled();
    await page.screenshot({ path: path.join(artifacts, 'negotiation.png'), fullPage: true });

    // A review dialog cannot confirm if its evidence identity changes while open.
    await page.getByRole('button', { name: 'Revisar e confirmar' }).click();
    const evidenceSnapshot = await page.evaluate(()=>{const r=requests.find(item=>item.id==='TR-0087'),saved={evidence:r.evidence,evidenceAt:r.evidenceAt,evidenceType:r.evidenceType};r.evidence='evidencia-trocada.pdf';r.evidenceType='application/pdf';return saved});
    await page.getByRole('button', { name: 'Confirmar troca', exact: true }).click();
    await expect(page.getByText('As condições exibidas mudaram. O detalhe foi atualizado; revise antes de confirmar.')).toBeVisible();
    expect(await page.evaluate(()=>{const r=requests.find(item=>item.id==='TR-0087');return {status:r.status,origin:getWeek(r.origin).state,target:getWeek(r.target).state}})).toEqual({status:'Em negociação',origin:'waiting',target:'reserved'});
    await page.evaluate(saved=>{const r=requests.find(item=>item.id==='TR-0087');Object.assign(r,saved);renderExchangeDetail()},evidenceSnapshot);
    await page.getByRole('button', { name: 'Revisar e confirmar' }).click();
    await page.screenshot({ path: path.join(artifacts, 'confirmation.png'), animations: 'disabled' });
    await page.getByRole('button', { name: 'Confirmar troca', exact: true }).click();
    await expect(page.getByText('Troca concluída na simulação. Estoque atualizado.')).toBeVisible();
    await expect(page.getByText('Troca concluída · somente leitura')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Adicionar observação' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Liberar reserva' })).toHaveCount(0);
    await expect(page.getByLabel('Anexar aceite de WhatsApp')).toHaveCount(0);
    const state = await page.evaluate(() => {
      const request = requests.find(r => r.id === 'TR-0087');
      return { request, origin: getWeek(request.origin), target: getWeek(request.target) };
    });
    expect(state.origin.state).toBe('available');
    expect(state.origin.traded).toBe(true);
    expect(state.target.state).toBe('use');
    expect(state.target.owner).toBe('João Pedro');
    expect(state.target.original).toBe(false);
    expect(state.target.received).toBe(true);

    // Confirmation is synchronized with all operational views.
    await page.locator('#nav [data-nav="dashboard"]').click();
    await expect(page.locator('[data-dashboard-metric="available"]')).toHaveText('15');
    await expect(page.locator('[data-dashboard-metric="service"]')).toHaveText('2');
    await expect(page.locator('[data-dashboard-metric="unattended"]')).toHaveText('1');
    await page.locator('[data-nav="calendar"]').click();
    await page.evaluate(start => { calendarDate = start; calendarView = 'week'; renderOperationalGrid(); }, state.origin.start);
    await expect(page.locator(`.week-item[data-week="${state.origin.id}"]`)).toHaveClass(/available/);
    await page.evaluate(start => { calendarDate = start; renderOperationalGrid(); }, state.target.start);
    await expect(page.locator(`.week-item[data-week="${state.target.id}"]`)).toHaveClass(/use/);
    await page.locator(`.week-item[data-week="${state.target.id}"]`).click();
    await expect(page.getByText('Semana recebida em troca. Não elegível para uma nova troca.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Criar pedido' })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await page.locator('[data-nav="bank"]').first().click();
    await expect(page.locator(`[data-week="${state.origin.id}"]`)).toHaveCount(1);
    await expect(page.locator(`[data-week="${state.target.id}"]`)).toHaveCount(0);
    await page.locator('[data-nav="requests"]').first().click();
    await expect(page.locator('tr').filter({ has: page.locator('[data-request="TR-0087"]') })).toContainText('Concluído');
    await page.locator('[data-request="TR-0087"]').click();
    await page.getByRole('button', { name: 'Voltar aos Pedidos' }).click();

    // Expired reservations require a manual release, never a request cancellation.
    await page.locator('[data-request="TR-0082"]').click();
    await expect(page.getByText('48h encerradas — ação do operador necessária')).toBeVisible();
    const expiredTargetId = await page.evaluate(() => requests.find(r => r.id === 'TR-0082').target);
    await page.getByRole('button', { name: 'Liberar reserva', exact: true }).click();
    await expect(page.getByRole('dialog')).not.toContainText(/cancelar/i);
    await page.evaluate(()=>{requests.find(r=>r.id==='TR-0082').target=null});
    await page.getByRole('dialog').getByRole('button', { name: 'Liberar reserva' }).click();
    await expect(page.getByText('As condições exibidas mudaram. O detalhe foi atualizado; revise antes de confirmar.')).toBeVisible();
    expect(await page.evaluate(targetId=>({requestTarget:requests.find(r=>r.id==='TR-0082').target,targetState:getWeek(targetId).state}),expiredTargetId)).toEqual({requestTarget:null,targetState:'reserved'});
    await page.evaluate(targetId=>{requests.find(r=>r.id==='TR-0082').target=targetId;renderExchangeDetail()},expiredTargetId);
    await page.getByRole('button', { name: 'Liberar reserva', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Liberar reserva' }).click();
    const released = await page.evaluate(targetId => {
      const request = requests.find(r => r.id === 'TR-0082'), week = getWeek(targetId);
      return { request, week, firstCompatible: compatible(week)[0]?.id };
    }, expiredTargetId);
    expect(released.request.target).toBeNull();
    expect(released.request.created).toBe('2026-09-08');
    expect(released.request.status).toBe('Aberto');
    expect(released.week.state).toBe('available');
    expect(released.firstCompatible).toBe('TR-0082');
    await page.locator('[data-nav="dashboard"]').click();
    await expect(page.locator('[data-dashboard-metric="available"]')).toHaveText('16');
    await expect(page.locator('[data-dashboard-metric="unattended"]')).toHaveText('2');
    await page.locator('[data-nav="calendar"]').first().click();
    await page.evaluate(start=>{calendarDate=start;calendarView='week';renderOperationalGrid()},released.week.start);
    await expect(page.locator(`.week-item[data-week="${expiredTargetId}"]`)).toHaveClass(/available/);
    await page.locator('[data-nav="bank"]').first().click();
    await expect(page.locator(`[data-week="${expiredTargetId}"]`)).toHaveCount(1);
    await page.locator('[data-nav="requests"]').first().click();
    await expect(page.locator('tr').filter({has:page.locator('[data-request="TR-0082"]')})).toContainText('opção disponível');
    await page.locator('[data-nav="calendar"]').first().click();
    await page.getByRole('button', { name: 'Novo pedido de troca' }).click();
    expect(await page.locator('select[name="origin"] option').evaluateAll((options, receivedId) => options.some(option => option.value === receivedId), state.target.id)).toBe(false);
    await page.locator('select[name="origin"]').selectOption({ index: 1 });
    await page.locator('input[name="desired"]').fill('2027-04-05');
    await page.getByRole('button', { name: 'Criar pedido e buscar opções' }).click();
    await expect(page.getByText('Escolha uma quinta-feira (casa) ou sexta-feira (flat).')).toBeVisible();
    await page.locator('input[name="desired"]').fill('2027-04-16');
    await page.getByRole('button', { name: 'Criar pedido e buscar opções' }).click();
    await expect(page.getByRole('heading', { name: 'Detalhe da troca', exact: true })).toBeVisible();
    await expect(page.getByLabel('Metadados da troca')).toContainText('TR-0089');
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(await page.locator('.exchange-panels').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(1);
    expect(await page.locator('.exchange-progress').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(1);
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.locator('[data-nav="calendar"]').first().click();
    await expect(page.locator('#notifications')).toHaveText('');
    await page.setViewportSize({ width: 900, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('heading', { name: 'Calendário de semanas' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.locator('button[data-calendar-view="year"]').click();
    expect(await page.locator('.year-grid').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(2);
    await page.screenshot({ path: path.join(artifacts, 'calendar-year-mobile.png'), fullPage: true, animations: 'disabled' });
    await page.locator('button[data-calendar-view="month"]').click();
    await expect(page.locator('.month-event-text').first()).toHaveCSS('display', 'none');
    await page.screenshot({ path: path.join(artifacts, 'mobile.png'), fullPage: true });
    await page.locator('button[data-calendar-view="week"]').click();
    await expect(page.locator('.week-agenda')).toHaveCSS('flex-direction', 'column');
    await page.screenshot({ path: path.join(artifacts, 'calendar-week-mobile.png'), fullPage: true, animations: 'disabled' });
    await page.getByRole('button', { name: 'Ampliar calendário' }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight)).toBe(true);
    await page.screenshot({ path: path.join(artifacts, 'calendar-focused-mobile.png'), animations: 'disabled' });
    await page.getByRole('button', { name: 'Voltar à visão normal' }).click();
    await expect(page.locator('.sidebar')).toBeVisible();
    expect(errors).toEqual([]);
    console.log('PASS: opções ordenadas por rank; confirmações rejeitam estado obsoleto; evidência inválida↔válida é coerente; reserva, troca e liberação sincronizam Dashboard/Calendário/Banco/Pedidos; fluxo único e responsividade sem regressões.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
