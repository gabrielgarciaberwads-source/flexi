const { chromium, expect } = require('@playwright/test');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fs = require('node:fs');

const noHorizontalOverflow = page => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
const columnCount = locator => locator.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
const prepareScreenshot = page => page.evaluate(() => {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  window.scrollTo(0, 0);
});
const dashboardRequestIds = (page, panel) => page.locator(`${panel} .dashboard-row`).evaluateAll(rows => rows.map(row => row.dataset.request));
const activeElementIsUsable = page => page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.isConnected && !document.activeElement.closest('[inert]'));
const assertAvatarCircle = async page => {
  const geometry = await page.locator('.avatar').evaluate(element => {
    const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
    return { width: rect.width, height: rect.height, radius: style.borderRadius, shrink: style.flexShrink, aspectRatio: style.aspectRatio };
  });
  expect(Math.abs(geometry.width - geometry.height)).toBeLessThanOrEqual(.5);
  expect(geometry.width).toBeGreaterThanOrEqual(40);
  expect(geometry.radius).toBe('50%');
  expect(geometry.shrink).toBe('0');
  expect(geometry.aspectRatio).toBe('1 / 1');
};
const contrastRatio = locator => locator.evaluateAll(elements => {
  const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
  const channel = value => { value /= 255; return value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4; };
  const luminance = value => { const color = rgb(value).map(channel); return .2126 * color[0] + .7152 * color[1] + .0722 * color[2]; };
  return elements.map(element => {
    const style = getComputedStyle(element), a = luminance(style.color), b = luminance(style.backgroundColor);
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  });
});

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const artifacts = path.join(__dirname, '..', 'artifacts');
  fs.mkdirSync(artifacts, { recursive: true });

  try {
    await page.goto(pathToFileURL(path.join(__dirname, '..', 'preview', 'index.html')).href);

    // Shell, dashboard, and the fixed circular operator avatar.
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await expect(page.locator('[data-nav="dashboard"]')).toHaveAttribute('aria-current', 'page');
    await expect(page.getByText('Flexi · Gestão de trocas', { exact: true })).toBeVisible();
    await expect(page.locator('.brand-logo')).toHaveAttribute('alt', 'Ownerinc');
    expect(await page.locator('.brand-logo').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    expect(await page.evaluate(async () => { await document.fonts.ready; return document.fonts.check('16px Novelin'); })).toBe(true);
    await expect(page.locator('[data-dashboard-metric="available"]')).toHaveText('15');
    await expect(page.locator('[data-dashboard-metric="service"]')).toHaveText('1');
    await expect(page.locator('[data-dashboard-metric="unattended"]')).toHaveText('2');
    await expect(page.locator('[data-dashboard-metric="total"]')).toHaveText('60');
    expect(await dashboardRequestIds(page, '#dashboard-service')).toEqual(['TR-0082']);
    expect(await dashboardRequestIds(page, '#dashboard-unattended')).toEqual(['TR-0087', 'TR-0088']);
    await expect(page.getByRole('button', { name: 'Explorar ícones e movimento' })).toHaveCount(0);
    await expect(page.locator('[data-visual-action], [data-icon-family], #motion-toggle')).toHaveCount(0);
    await assertAvatarCircle(page);
    expect(await noHorizontalOverflow(page)).toBe(true);

    const domainFixture = await page.evaluate(() => {
      const activeOrigins = requests.filter(request => request.status !== 'Concluído').map(request => request.origin);
      const states = Object.fromEntries(Object.keys(labels).map(state => [state, weeks.filter(week => week.state === state).length]));
      return {
        total: weeks.length,
        sevenNights: weeks.every(week => (date(week.end) - date(week.start)) / 86400000 === 7),
        correctCheckin: weeks.every(week => date(week.start).getUTCDay() === (getUnit(week).kind === 'Casa' ? 4 : 5)),
        pastAvailability: weeks.filter(week => week.start <= DEMO_TODAY && week.state === 'available').length,
        months2026: [...new Set(weeks.filter(week => week.start.startsWith('2026-')).map(week => week.start.slice(5, 7)))].sort(),
        uniqueActiveOrigins: new Set(activeOrigins).size === activeOrigins.length,
        leadDays: (date(origin.start) - date(DEMO_TODAY)) / 86400000,
        crossYearRange: range(origin),
        states
      };
    });
    expect(domainFixture.total).toBe(60);
    expect(domainFixture.sevenNights).toBe(true);
    expect(domainFixture.correctCheckin).toBe(true);
    expect(domainFixture.pastAvailability).toBe(0);
    expect(domainFixture.months2026).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']);
    expect(domainFixture.uniqueActiveOrigins).toBe(true);
    expect(domainFixture.leadDays).toBeGreaterThanOrEqual(90);
    expect(domainFixture.crossYearRange).toBe('31 de dez 2026 — 07 de jan 2027');
    expect(Object.values(domainFixture.states).every(count => count > 0)).toBe(true);

    await prepareScreenshot(page);
    await page.screenshot({ path: path.join(artifacts, 'dashboard-desktop.png'), fullPage: true, animations: 'disabled' });

    await page.setViewportSize({ width: 900, height: 900 });
    expect(Math.round((await page.locator('.sidebar').boundingBox()).width)).toBe(112);
    await assertAvatarCircle(page);
    expect(await noHorizontalOverflow(page)).toBe(true);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.sidebar')).toBeHidden();
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await expect(page.getByRole('button', { name: 'Fechar menu' }).first()).toBeFocused();
    await assertAvatarCircle(page);
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#nav [data-nav="owners"]')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeFocused();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await expect(page.locator('.sidebar')).toHaveCSS('transition-duration', '0s');
    await page.keyboard.press('Escape');
    await page.emulateMedia({ reducedMotion: 'no-preference' });

    // Dashboard search and drawer focus restoration.
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.getByLabel('Buscar no painel').fill('SEM-223');
    await expect(page.locator('#dashboard-available .dashboard-row')).toHaveCount(1);
    const dashboardWeek = page.locator('#dashboard-available .dashboard-row');
    await dashboardWeek.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeFocused();
    await expect(page.getByRole('dialog')).toContainText('08/01/2027 · sexta-feira');
    await expect(page.getByRole('dialog')).toContainText('15/01/2027 · 7 noites');
    await page.keyboard.press('Escape');
    await expect(dashboardWeek).toBeFocused();
    await page.getByLabel('Buscar no painel').fill('');

    // Calendar starts in September 2026 and exposes only Month and Year.
    await page.locator('[data-nav="calendar"]').click();
    await expect(page.getByRole('heading', { name: 'Calendário de semanas', exact: true })).toBeVisible();
    await expect(page.locator('.operational-calendar')).toHaveAttribute('data-calendar-view', 'month');
    await expect(page.locator('#calendar-period-title')).toHaveText('setembro de 2026');
    await expect(page.locator('#visible-count')).toHaveText('4 semanas neste período');
    await expect(page.locator('.calendar-segmented button')).toHaveText(['Ano', 'Mês']);
    await expect(page.locator('button[data-calendar-view="week"], [data-calendar-render="week"], .week-agenda')).toHaveCount(0);
    await expect(page.locator('.month-weekdays span')).toHaveText(['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']);
    expect(await page.locator('.month-event').evaluateAll(events => events.every(event => event.classList.contains('use')))).toBe(true);
    await prepareScreenshot(page);
    await page.screenshot({ path: path.join(artifacts, 'calendar-month.png'), fullPage: true, animations: 'disabled' });

    // Every semantic state renders as a real seven-night line in its actual month.
    const semanticStates = ['available', 'use', 'waiting', 'reserved', 'blocked', 'noanswer'];
    const semanticLabels = {
      available: 'Disponível no banco', use: 'Uso confirmado', waiting: 'Pedido de troca aberto',
      reserved: 'Em negociação', blocked: 'Bloqueada · inadimplência', noanswer: 'Sem retorno'
    };
    for (const state of semanticStates) {
      const fixture = await page.evaluate(expectedState => {
        filters.kind = ''; filters.type = ''; filters.state = ''; filters.q = ''; filters.only = false;
        const week = weeks.find(item => item.state === expectedState);
        calendarView = 'month'; calendarDate = week.start; renderOperationalGrid();
        return { id: week.id, start: week.start, end: week.end, unit: getUnit(week).name };
      }, state);
      const lines = page.locator(`.month-event.${state}[data-week="${fixture.id}"]`);
      expect(await lines.count()).toBeGreaterThan(0);
      await expect(lines.first()).toHaveAttribute('data-period-start', fixture.start);
      await expect(lines.first()).toHaveAttribute('data-period-end', fixture.end);
      await expect(lines.first()).toHaveAttribute('aria-label', new RegExp(`${fixture.unit}.*${semanticLabels[state]}`));
      expect((await contrastRatio(lines)).every(ratio => ratio >= 4.5)).toBe(true);
    }

    // A Thursday-to-Thursday period is split at the week boundary as 4 + 3 nights.
    await page.evaluate(() => { calendarDate = '2026-10-01'; calendarView = 'month'; renderOperationalGrid(); });
    const splitWeek = page.locator('.month-event[data-week="SEM-204"]');
    await expect(splitWeek).toHaveCount(2);
    await expect(splitWeek.nth(0)).toHaveAttribute('data-period-start', '2026-10-01');
    await expect(splitWeek.nth(0)).toHaveAttribute('data-period-end', '2026-10-08');
    await expect(splitWeek.nth(0)).toHaveAttribute('data-segment-start', '2026-10-01');
    await expect(splitWeek.nth(0)).toHaveAttribute('data-segment-end', '2026-10-05');
    await expect(splitWeek.nth(1)).toHaveAttribute('data-segment-start', '2026-10-05');
    await expect(splitWeek.nth(1)).toHaveAttribute('data-segment-end', '2026-10-08');
    expect(await splitWeek.evaluateAll(segments => segments.reduce((sum, segment) => sum + (Date.parse(`${segment.dataset.segmentEnd}T12:00:00Z`) - Date.parse(`${segment.dataset.segmentStart}T12:00:00Z`)) / 86400000, 0))).toBe(7);

    // Month/year navigation preserves context; Today returns to the demonstration date.
    await page.evaluate(() => { calendarDate = DEMO_TODAY; calendarView = 'month'; renderOperationalGrid(); });
    await page.getByRole('button', { name: 'Mês anterior' }).click();
    await expect(page.locator('#calendar-period-title')).toHaveText('agosto de 2026');
    await page.getByRole('button', { name: 'Próximo mês' }).click();
    await expect(page.locator('#calendar-period-title')).toHaveText('setembro de 2026');
    await page.locator('button[data-calendar-view="year"]').click();
    await expect(page.locator('#calendar-period-title')).toHaveText('2026');
    await expect(page.locator('#visible-count')).toHaveText('58 semanas neste período');
    await expect(page.locator('.mini-month')).toHaveCount(12);
    await expect(page.locator('.year-status-key')).toHaveText(Object.values(semanticLabels));
    await page.getByRole('button', { name: 'Ano anterior' }).click();
    await expect(page.locator('#calendar-period-title')).toHaveText('2025');
    await expect(page.getByText('Nenhuma semana corresponde aos filtros neste período.')).toBeVisible();
    await page.getByRole('button', { name: 'Hoje', exact: true }).click();
    await expect(page.locator('#calendar-period-title')).toHaveText('2026');
    expect(await page.evaluate(() => calendarDate)).toBe('2026-09-29');
    await page.getByRole('button', { name: 'Próximo ano' }).click();
    await expect(page.locator('#calendar-period-title')).toHaveText('2027');
    await expect(page.locator('#visible-count')).toHaveText('2 semanas neste período');
    await page.getByRole('button', { name: 'Hoje', exact: true }).click();

    // A month title or a day in Year drills into Month, never into a removed Week mode.
    await page.locator('.mini-month-header').nth(9).click();
    await expect(page.locator('.operational-calendar')).toHaveAttribute('data-calendar-view', 'month');
    await expect(page.locator('#calendar-period-title')).toHaveText('outubro de 2026');
    expect(await page.evaluate(() => calendarDate)).toBe('2026-10-01');
    await page.locator('button[data-calendar-view="year"]').click();
    await page.locator('[data-calendar-date="2026-10-08"]').click();
    await expect(page.locator('.operational-calendar')).toHaveAttribute('data-calendar-view', 'month');
    await expect(page.locator('#calendar-period-title')).toHaveText('outubro de 2026');
    expect(await page.evaluate(() => calendarDate)).toBe('2026-10-08');
    await expect(page.locator('[data-calendar-render="week"], .week-agenda')).toHaveCount(0);

    // Filters survive Month/Year switches.
    await page.getByLabel('Tipo de acomodação').selectOption('Casa');
    await page.getByLabel('Tipologia', { exact: true }).selectOption('B');
    await page.getByLabel('Situação', { exact: true }).selectOption('available');
    await page.getByLabel('Buscar unidade, titular ou semana').fill('Casa');
    await page.locator('button[data-calendar-view="year"]').click();
    await expect(page.getByLabel('Tipo de acomodação')).toHaveValue('Casa');
    await expect(page.getByLabel('Tipologia', { exact: true })).toHaveValue('B');
    await expect(page.getByLabel('Situação', { exact: true })).toHaveValue('available');
    await expect(page.getByLabel('Buscar unidade, titular ou semana')).toHaveValue('Casa');
    expect(Number((await page.locator('#visible-count').textContent()).match(/\d+/)[0])).toBeGreaterThan(0);
    await page.locator('button[data-calendar-view="month"]').click();
    await expect(page.locator('[data-calendar-render="month"]')).toBeVisible();
    await page.getByLabel('Tipo de acomodação').selectOption('');
    await page.getByLabel('Tipologia', { exact: true }).selectOption('');
    await page.getByLabel('Situação', { exact: true }).selectOption('');
    await page.getByLabel('Buscar unidade, titular ou semana').fill('');

    // Calendar focus mode and mobile layouts remain usable.
    await page.getByRole('button', { name: 'Ampliar calendário' }).click();
    await expect(page.locator('.sidebar')).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('.sidebar')).toBeVisible();
    await page.locator('button[data-calendar-view="year"]').click();
    await prepareScreenshot(page);
    await page.screenshot({ path: path.join(artifacts, 'calendar-year.png'), fullPage: true, animations: 'disabled' });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await columnCount(page.locator('.year-grid'))).toBe(2);
    expect(await noHorizontalOverflow(page)).toBe(true);
    await page.locator('button[data-calendar-view="month"]').click();
    expect(await page.locator('.month-event').evaluateAll(events => events.every(event => {
      const symbol = event.querySelector('.status-symbol'), text = event.querySelector('.month-event-text');
      return getComputedStyle(symbol).display !== 'none' && getComputedStyle(text).display === 'none';
    }))).toBe(true);
    await prepareScreenshot(page);
    await page.screenshot({ path: path.join(artifacts, 'calendar-month-mobile.png'), fullPage: true, animations: 'disabled' });
    await page.setViewportSize({ width: 1440, height: 960 });

    // Bank uses the distributed future inventory instead of one artificial April block.
    await page.locator('[data-nav="bank"]').click();
    await expect(page.getByRole('heading', { name: 'Banco de semanas', exact: true })).toBeVisible();
    await expect(page.locator('#month-label')).toHaveText('outubro de 2026');
    await expect(page.locator('.week')).toHaveCount(6);
    await expect(page.locator('.week:not(.available)')).toHaveCount(0);
    await expect(page.locator('#visible-count')).toHaveText('6 semanas disponíveis neste período');
    await page.evaluate(() => { month = 0; year = 2027; renderGrid(); });
    await expect(page.locator('[data-week="SEM-223"]')).toHaveCount(1);
    await page.locator('[data-week="SEM-223"]').click();
    await expect(page.getByRole('heading', { name: 'Pedidos compatíveis (2)' })).toBeVisible();
    await page.keyboard.press('Escape');

    // Reserve, contact, evidence, and confirmation preserve the exchange rules.
    await page.locator('[data-nav="requests"]').click();
    await page.locator('[data-request="TR-0087"]').click();
    await expect(page.getByRole('heading', { name: 'Detalhe da troca', exact: true })).toBeVisible();
    await expect(page.locator('.exchange-option')).toHaveCount(1);
    await expect(page.locator('.exchange-option')).toHaveAttribute('data-option-week', 'SEM-223');
    await expect(page.locator('.exchange-option-rank')).toHaveText('1º');
    await page.getByRole('button', { name: 'Reservar', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Confirmar reserva' }).click();
    await expect(page.getByRole('button', { name: 'Registrar contato e verificar 90 dias' })).toBeFocused();
    expect(await page.evaluate(() => {
      const request = requests.find(item => item.id === 'TR-0087');
      return { status: request.status, origin: getWeek(request.origin).state, target: getWeek(request.target).state };
    })).toEqual({ status: 'Em negociação', origin: 'waiting', target: 'reserved' });

    await page.getByRole('button', { name: 'Registrar contato e verificar 90 dias' }).click();
    await expect(page.getByRole('dialog')).toContainText('93 dias');
    await page.getByRole('dialog').getByRole('button', { name: 'Confirmar contato' }).click();
    const evidence = page.locator('#evidence');
    await expect(evidence).toBeFocused();
    await evidence.setInputFiles({ name: 'aceite-invalido.txt', mimeType: 'text/plain', buffer: Buffer.from('invalid') });
    await expect(page.getByText('Selecione uma imagem PNG, JPEG, WebP ou um PDF.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Revisar e confirmar' })).toBeDisabled();
    await evidence.setInputFiles({ name: 'aceite-demo.png', mimeType: 'image/png', buffer: Buffer.from('preview-only') });
    await expect(page.locator('#evidence-status')).toContainText('Comprovante aceito');
    await expect(page.getByRole('button', { name: 'Revisar e confirmar' })).toBeEnabled();

    const observation = page.getByRole('button', { name: 'Adicionar observação' });
    await observation.click();
    await page.getByRole('textbox', { name: 'Observação', exact: true }).fill('Titular prefere contato no período da tarde.');
    await page.getByRole('dialog').getByRole('button', { name: 'Adicionar observação', exact: true }).click();
    await expect(page.locator('.observation-item')).toContainText('29/09/2026');
    await expect(page.locator('.observation-item')).toContainText('Titular prefere contato no período da tarde.');

    await prepareScreenshot(page);
    await page.screenshot({ path: path.join(artifacts, 'negotiation.png'), fullPage: true, animations: 'disabled' });
    await page.getByRole('button', { name: 'Revisar e confirmar' }).click();
    await page.getByRole('button', { name: 'Confirmar troca', exact: true }).click();
    await expect(page.getByText('Troca concluída na simulação. Estoque atualizado.')).toBeVisible();
    await expect(page.getByText('Troca concluída · somente leitura')).toBeVisible();
    const completed = await page.evaluate(() => {
      const request = requests.find(item => item.id === 'TR-0087'), originWeek = getWeek(request.origin), targetWeek = getWeek(request.target);
      return { status: request.status, originState: originWeek.state, originTraded: originWeek.traded, targetState: targetWeek.state, targetOwner: targetWeek.owner, targetReceived: targetWeek.received };
    });
    expect(completed).toEqual({ status: 'Concluído', originState: 'available', originTraded: true, targetState: 'use', targetOwner: 'João Pedro', targetReceived: true });

    // Expired reservations are released manually and retain request priority.
    await page.locator('[data-nav="requests"]').click();
    await page.locator('[data-request="TR-0082"]').click();
    await expect(page.getByText('48h encerradas — ação do operador necessária')).toBeVisible();
    await page.getByRole('button', { name: 'Liberar reserva', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Liberar reserva' }).click();
    const released = await page.evaluate(() => {
      const request = requests.find(item => item.id === 'TR-0082'), week = getWeek('SEM-190');
      return { target: request.target, status: request.status, created: request.created, weekState: week.state, priority: compatible(week)[0]?.id };
    });
    expect(released).toEqual({ target: null, status: 'Aberto', created: '2026-09-08', weekState: 'available', priority: 'TR-0082' });

    // New requests reject invalid check-in weekdays and remain responsive.
    await page.locator('[data-nav="calendar"]').click();
    await page.getByRole('button', { name: 'Novo pedido de troca' }).click();
    await page.locator('select[name="origin"]').selectOption({ index: 1 });
    await page.locator('input[name="desired"]').fill('2027-01-05');
    await page.getByRole('button', { name: 'Criar pedido e buscar opções' }).click();
    await expect(page.getByText('Escolha uma quinta-feira (casa) ou sexta-feira (flat).')).toBeVisible();
    await page.locator('input[name="desired"]').fill('2027-01-08');
    await page.getByRole('button', { name: 'Criar pedido e buscar opções' }).click();
    await expect(page.getByLabel('Metadados da troca')).toContainText('TR-0089');
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await noHorizontalOverflow(page)).toBe(true);
    expect(await columnCount(page.locator('.exchange-panels'))).toBe(1);
    expect(await columnCount(page.locator('.exchange-progress'))).toBe(1);
    await prepareScreenshot(page);
    await page.screenshot({ path: path.join(artifacts, 'exchange-detail-mobile.png'), fullPage: true, animations: 'disabled' });

    expect(await activeElementIsUsable(page)).toBe(true);
    expect(errors).toEqual([]);
    console.log('PASS: shell e avatar circular; calendário Ano/Mês em 2026; períodos realistas de sete noites; troca, acessibilidade, responsividade e ausência de overflow sem regressões.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
