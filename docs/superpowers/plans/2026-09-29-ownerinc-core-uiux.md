# Ownerinc Flexi Core UI/UX Implementation Plan

> **For agentic workers:** Implement one task at a time, commit only files in `projects/Flexi-V1`, run the named checks, and write the requested report before returning.

**Goal:** Redesign the Flexi operational core with an Ownerinc shell, a dashboard home, an Apple Calendar-inspired year/month/week calendar, and an integrated exchange-detail flow while preserving every validated exchange rule.

**Architecture:** Keep the existing dependency-free prototype and in-memory domain model. Extend `preview/index.html` with focused render/data-selector functions and shared visual tokens rather than introducing a framework. Keep Playwright coverage in `scripts/check-preview.cjs`, and make all three redesigned screens derive from the same `weeks` and `requests` arrays.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, local official Ownerinc assets, Node.js, Playwright.

## Global Constraints

- Keep all product changes inside `projects/Flexi-V1`.
- The app remains dependency-free and must open directly from `preview/index.html` using a `file://` URL.
- Use only the existing official Ownerinc logo and Novelin font files; do not invent a logo variant or official color code.
- Use Ownerinc as the primary shell identity and `Flexi · Gestão de trocas` as the module label.
- Dashboard is the initial view.
- Calendar defaults to Month and supports Year, Month, and Week views inspired by Apple Calendar.
- Preserve the existing in-memory rules: seven nights; houses Thursday-to-Thursday; flats Friday-to-Friday; original-request priority; origin remains with owner until confirmation; 90-day check; local WhatsApp evidence; manual release of expired reservation; received weeks cannot be traded again; confirmation moves origin into and destination out of the bank.
- Preserve access to Bank, Requests, and Owners even though their content layouts are not part of this redesign phase.
- Owner detail, Excel import, backend, authentication, persistence, export, and real property photography are out of scope.
- Responsive behavior must be functional on desktop, tablet, and mobile.
- Respect keyboard navigation, visible focus, `Escape`, WCAG AA contrast, and `prefers-reduced-motion`.
- Do not modify unrelated files or existing uncommitted workspace changes.

---

### Task 1: Ownerinc shell and operational dashboard

**Files:**
- Create: `preview/assets/ownerinc-completa-black.png`
- Create: `preview/assets/novelin-regular.otf`
- Create: `preview/assets/novelin-bold.otf`
- Modify: `preview/index.html`
- Modify: `scripts/check-preview.cjs`

**Requirements:**
- Copy the existing official files from `projects/ownerinc-brain/src/brain-app/assets/logos/ownerinc-completa-black.png` and `projects/ownerinc-brain/src/brain-app/assets/fonts/novelin-{regular,bold}.otf` into Flexi.
- Build a light Ownerinc sidebar with official logo, module label, Dashboard, Calendar, Bank, Requests, Owners, and operator profile.
- Keep existing navigation targets functional and make Dashboard the initial view.
- Add pure dashboard selectors derived from `weeks` and `requests` for available weeks, in-service requests, unattended requests, and total weeks.
- Render four metric cards and three operational columns. Search filters all three columns. Rows link to the relevant week, request, Bank, or Requests view. `Ver todos` links remain functional.
- Keep the existing new-request action.
- Update tests so initial Dashboard metrics, search, links, and navigation are verified before the task is complete.

**Acceptance checks:**
- `node scripts/check-preview.cjs` passes.
- Dashboard is the first visible heading.
- No console errors occur.
- Existing Calendar, Bank, Requests, Owners, and new-request navigation still work.

---

### Task 2: Apple-inspired multi-view calendar

**Files:**
- Modify: `preview/index.html`
- Modify: `scripts/check-preview.cjs`

**Requirements:**
- Add calendar view state with exact values `year`, `month`, and `week`; default to `month`.
- Add a segmented `Ano · Mês · Semana` control, previous/today/next navigation, contextual period title, accommodation/type/status filters, search, and expanded-calendar mode.
- Year renders twelve mini-months with compact status markers and supports drilling into Month or Week.
- Month renders a Monday-first calendar grid, multi-day seven-night items, continuation styling, compact labels, and a deterministic `+N itens` overflow interaction.
- Week renders seven days without an hourly ruler; group/lay out operational items by date and preserve exact periods.
- Preserve selected/context date, filters, and search when changing views.
- Every item opens the shared week drawer; negotiated items can reach exchange detail.
- On mobile, Year stays compact, Month uses markers/counts when labels cannot fit, and Week becomes a vertical day agenda.
- Add Playwright coverage for all three views, navigation, state preservation, overflow, drawer, expanded mode, and mobile layout.

**Acceptance checks:**
- `node scripts/check-preview.cjs` passes.
- Month is the first Calendar view.
- Year, Month, and Week each render records from the same `weeks` array.
- Filters produce a clear empty state and do not reset when changing view.

---

### Task 3: Exchange detail redesign and synchronized operations

**Files:**
- Modify: `preview/index.html`
- Modify: `scripts/check-preview.cjs`

**Requirements:**
- Redesign the existing negotiation screen as `Detalhe da troca` inside the Ownerinc shell.
- Add contextual Back behavior, exchange code/date/responsible metadata, owner, and status badge.
- Render side-by-side origin/destination panels on desktop, with exact unit, type, dates, week code, current intention, and transfer consequence. Do not add fictional photographs.
- If there is no destination, show priority-ordered options with reserve action.
- Render exactly four progress stages: Pedido criado, Opção reservada, Aceite validado, Troca concluída.
- Keep history/observations and provide an Add observation interaction that records author/date in memory.
- Preserve reserve, 90-day contact verification, local evidence validation, review/confirm, expired-release, and completed-read-only behavior.
- Use state-specific actions and confirmation dialogs. Releasing a reservation must not be labeled as canceling the request.
- Synchronize mutations immediately with Dashboard, Calendar, Bank, and Requests.
- Add tests for entry from Dashboard and Calendar and for every existing negotiation rule.

**Acceptance checks:**
- `node scripts/check-preview.cjs` passes.
- Reservation, contact, evidence, confirmation, release, and received-week constraints remain valid.
- Confirmed changes are visible after navigating to Dashboard, Calendar, and Bank.

---

### Task 4: Responsive, accessibility, and visual-polish pass

**Files:**
- Modify: `preview/index.html`
- Modify: `scripts/check-preview.cjs`

**Requirements:**
- Standardize shared spacing, typography, border, button, field, badge, focus, empty-state, modal, drawer, toast, and motion styles.
- Use Novelin for the UI and keep Signaturia out of the operational interface.
- Use a restrained off-white/white/near-black shell, functional blue actions, and semantic status colors. Every status must also have text or an icon.
- Sidebar is expanded on desktop, compact on tablet, and drawer-style/collapsible on mobile without making the official logo illegible.
- Dashboard columns stack on tablet/mobile; metric cards become 2x2 on mobile.
- Exchange panels stack and progress becomes vertical on mobile; primary actions remain reachable.
- Ensure no page-level horizontal overflow at 1440x960, tablet, or 390x844; only calendar internals may scroll.
- Verify focus trap/restoration in layers, keyboard navigation, Escape priority, reduced motion, and minimum usable control sizes.
- Extend screenshots/checks for Dashboard, Calendar Year/Month/Week, Exchange Detail, and mobile states.

**Acceptance checks:**
- `node scripts/check-preview.cjs` passes with desktop and mobile screenshots.
- Browser console has no errors.
- `prefers-reduced-motion: reduce` disables nonessential movement.

---

### Task 5: Documentation and release verification

**Files:**
- Modify: `README.md`
- Modify: `scripts/check-preview.cjs` only if verification exposes a missing assertion.

**Requirements:**
- Document Ownerinc shell, Dashboard, Calendar Year/Month/Week, Exchange Detail, unchanged rules, responsive behavior, and the exact validation command.
- Clearly state that data are fictitious/in-memory and list deferred Owner Detail and Excel Import screens.
- Run the project check from `projects/Flexi-V1`.
- Run the root verification command from `C:/Ownerinc` and distinguish unrelated failures from Flexi failures.
- Inspect generated screenshots and report any visible clipping, overlap, illegible text, broken status meaning, or inconsistent navigation.

**Acceptance checks:**
- `node scripts/check-preview.cjs` passes.
- `npm run verify` result is recorded.
- README matches implemented behavior without unsupported claims.
