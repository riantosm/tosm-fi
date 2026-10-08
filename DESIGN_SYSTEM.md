# TosmFi design system — "Mist"

The single source of truth for the UI. The visual reference is `../design/tosmfi-redesign.pen`, organized as:

- 01 Design System
- 02 Auth
- 03 Dashboard
- 04 Transaksi
- 05 Dompet
- 06 Kategori
- 07 Jadwal
- 08 Budget
- 09 Investasi
- 10 Laporan
- 11 Profil
- 12 Pengaturan
- 13 Global
- 14 Catat Cepat

Everything here is already implemented in `src/css/index.css`, `src/components/*` and the app shell. Build features **only** from these pieces.

## 1. Golden rules

1. **Semantic tokens only.**
   - Use `bg-surface`, `text-text-2`, `bg-income-soft` and similar.
   - Never write `ink-*`, `primary-50…950`, `red-*`, `amber-*`, `emerald-*`, `blue-*`, `white`, or `black` colors.
   - Never write `dark:` color variants. Light and dark swap automatically through CSS variables.
   - The only exception is user data colors (wallet/category/instrument hex from the backend). Apply them via `style`, using a `26` alpha suffix for soft fills (`${color}26`).
2. **Reuse components.** If a pattern appears twice, it belongs in `src/components`. Don't hand-roll buttons, chips, cards, inputs, modals, or rows.
3. **Never change behavior.** Don't change these:
   - `hooks/`, `services/`, `redux/`, `types/`, `utils/` (except presentational helpers), `constants/routes.ts`, `api-docs.ts`.
   - Data flow, props semantics, infinite-scroll sentinels, navigation state, i18n keys in use.
   - Restyling may restructure JSX freely, but every feature, action, and state must survive.
4. **i18n.** Every visible string goes through `t()`. Prefer existing keys. When a new key is needed, add it to `id.json`, `en.json`, and `jp.json` at the same position. Edit those files with targeted edits only — never rewrite them wholesale.
5. **Icons.** Use `react-icons/lu` (Lucide) only. Category icons always come from `resolveCategoryIcon(name)` (`constants/category-icons.ts`).
6. **Motion.** Use the `m` component from `motion/react` (the app runs `LazyMotion strict`, so the `motion.*` components will throw). Respect reduced motion: `MotionConfig reducedMotion="user"` is global, and CSS has a `prefers-reduced-motion` guard.

## 2. Tokens (`src/css/index.css`)

| Purpose | Tailwind classes |
| --- | --- |
| Page / card / inner box | `bg-bg` · `bg-surface` · `bg-surface-2` (inner boxes, inputs, inactive chips) · `bg-surface-3` (hover on surface-2) |
| Lines | `border-border` · `border-border-strong` |
| Text | `text-text` (primary) · `text-text-2` (secondary) · `text-text-3` (muted/meta) |
| Brand | `bg-primary` / `text-primary-fg` · `bg-primary-soft` / `text-primary-text` |
| Money | `income` / `expense` / `investment` / `cash` (each has `-soft` and `-text`) |
| Hero gradient | `bg-gradient-to-br from-hero-bg to-hero-bg-2`, text `text-hero-fg` / `text-hero-fg-2` |
| Rail active | `bg-nav-active-bg` / `text-nav-active-fg` |
| Charts | `var(--chart-1)` … `var(--chart-6)`. In Recharts pass `"var(--chart-1)"` as `stroke`/`fill`, never a hex |
| Code blocks | `bg-code-bg text-code-fg font-mono` |
| Radius | `rounded-card` (20) for cards · `rounded-control` (12) for inner boxes and inputs · `rounded-sheet` (28) for dialogs · `rounded-full` for buttons and chips |
| Shadow | `shadow-card` (cards) · `shadow-card-hover` · `shadow-pop` (dialogs/popovers) · `shadow-float` (toasts, FAB) |

**Fonts:**
- Inter (body, default).
- Outfit for `font-display` (titles) and `font-num` (amounts).
- Add the `tabular` utility for aligned digits. Weight is never above 600 (`font-semibold` is "strong").

## 3. Type scale

| Use | Classes |
| --- | --- |
| Page title (desktop) | `PageHeader` handles it (Outfit 30/600) |
| Card title | `SectionHead` (eyebrow 11 uppercase + Outfit 18) or `font-display text-[17px] lg:text-[18px] font-semibold` |
| Dialog title | `Modal title` (Outfit 21) |
| Body | `text-[14px] text-text` · secondary `text-[13px] text-text-2` · meta `text-[12–12.5px] text-text-3` |
| Big money | `font-num font-semibold tabular`, e.g. hero `text-[48px] tracking-[-0.025em]`, stat `text-[24–26px]` |
| Eyebrow / day header | `text-[11–12px] font-semibold uppercase tracking-[0.06–0.08em] text-text-3` |

Long labels in tight places (tiles, chips) are one line and `truncate`. They never wrap and never overflow.

## 4. Components

### Atoms (`src/components/atoms`)

- **`Button`**
  - `variant`: `primary | soft | outline | ghost | danger | danger-soft`
  - `size`: `sm` (36) | `md` (44) | `lg` (50)
  - Other props: `leftIcon`, `rightIcon`, `isLoading`, `fullWidth`
  - Always a pill. The native `type` default is kept (`submit` inside forms), so pass `type="button"` for non-submit buttons.
- **`IconButton`**
  - Required props: `label` (aria + tooltip) and `icon`.
  - `variant`: `surface | soft | ghost | outline | primary | danger`
  - `size`: `sm` (36) | `md` (40) | `lg` (44, use on phones)
- **`Input`**: 48px box on `surface-2`, focus ring. Props: `startIcon`, `endSlot`, `hasError`.
- **`Textarea`**: the multi-line twin of `Input` (same box, focus ring and type).
- **`Monogram`**: a two-letter tile for instruments and accounts. `variant="soft"` gives a `${color}26` fill with colored letters; `variant="solid"` gives a filled tile with white letters. `shape="circle"` (default) is used in pickers and asset allocation; `shape="square"` (rounded) is used on the Investasi page for instrument and account tiles.
- **`Checkbox`**: rounded square.
- **`Badge`**: `tone` = `neutral | primary | income | expense | investment | solid`.
- **`Avatar`**: initials.
- **`LogoMark`** / **`Logo`**: brand.
- **`AiMark`**: the AI identity, a solid primary circle with sparkles. It is the only AI icon.
- **`Skeleton`**: shimmer block.
- **`Tooltip`**, **`ThemeToggle`**, **`CopyButton`**, **`MethodBadge`**, **`ModalCloseButton`**, **`IconLoader`**.
- **`Reveal`**: fade and lift when scrolled into view. Props: `delay` for stagger, `immediate` for mount-animate.

### Molecules (`src/components/molecules`)

- **`Card`**
  - `rounded-card bg-surface shadow-card`. Default `padding="md"` is 20 on phones and 24 from `lg`.
  - Other props: `tone="soft" | "hero"`, and `interactive` (hover lift, for whole-card clicks).
- **`SectionHead`**
  - Props: `eyebrow`, `title`, `right` (controls/legend), and `actionLabel` + `onAction` (the "Lihat semua →" link).
- **`PageHeader`**
  - Required on every logged-in page. Props: `title`, `subtitle`, `actions` (desktop buttons), `mobileActions` (phone icon buttons, size `lg`), `backTo` (sub-pages), `leading`.
  - On phones it becomes the sticky app bar with the logo, or a back button on sub-pages.
  - In-page detail views (e.g. Budget detail) use `onBack` (a callback instead of navigation) and `hideOnDesktop`, which renders only the phone app bar because the view draws its own desktop heading.
- **`Chip`**
  - Filter chip. Active = primary-soft + primary stroke.
  - Props: `dot` (color), `icon`, `surface="page" | "card"`, `removable`.
- **`SegmentedControl`**
  - Toggles and tabs with a sliding thumb.
  - `variant="soft"` (surface-2 track) is for chart and form toggles.
  - `variant="solid"` (surface strip with a primary thumb) is for period and month tabs.
- **`Modal`**
  - Desktop shows a centered dialog; phones show a bottom sheet with a drag handle.
  - Props: `title`, `subtitle`, `onBack`, `headerActions`, `footer`, `size` (`sm` 440 · `md` 480 · `lg` 520 · `xl` 560 · `2xl` 640).
  - Put action buttons in `footer` with `<ModalActions>`. When the body contains a `<form id="x">`, the submit button in the footer uses `form="x"`.
  - Every dialog should use `title` instead of a hand-made header.
- **`AlertDialog`** (via `useConfirmDialog`), **`Toast`** (via `useToast`).
- **`EmptyState`**: `variant="compact"` (inside a card) or `variant="page"` (whole page).
- **`TxRowBase`**
  - The one row look: round 42px tile in `${color}26` with the colored icon, title, meta (`"Kategori · Dompet"`), amount, and time.
  - `TransactionRow`, `TransferRow`, `ScheduledTransactionRow`, investment ledger rows, and Catat Cepat preview rows all use it.
- **`FormField`** (label, helper, error), **`PasswordInput`**, **`ColorPicker`**, **`DonutChart`**, **`LanguageMenuButton`**.
- **Money dialog blocks.** Every add/edit/pay dialog is built from these:
  - **`AmountCard`**: the big "IDR 45.000" block. Props: `header` (usually `CategoryPickerRow`), `onPickAmount` (shows the calculator button), `caption`, `footer`, `align`.
  - **`CategoryPickerRow`**: the category + subcategory trigger.
  - **`PickerField`**: a labelled select-style trigger with a chevron (date & time, pickers).
  - **`WalletChipGroup`**: a labelled single-select row of wallet chips (`Chip variant="outline"`), with `disabledId` for the other side of a transfer.
  - **`AmountCalculatorKeypad`**: rows `789÷ / 456× / 123− / 000 0 , +`. Passing `confirmLabel` + `onConfirm` turns the last row into ⌫ + confirm.
  - **`Chip variant="outline"`**: a white chip with a stroke (wallet pickers). The default `soft` is for filters and quick picks.
  - **`SegmentedControl thumbClassName`**: overrides the sliding thumb, e.g. a primary-soft thumb on a white track.
- **`ReorderRow`**: one row of an "Atur urutan" list: a grip for dragging plus ↑/↓ buttons. Wallet, category and budget reorder items wrap it. `moveByIndex` and `moveItem` in `utils/reorder.ts` do the list moves.
- **`ViewModeToggle`**: a generic icon pair with a sliding thumb (`options` = value + icon + label). Dompet uses grid/list and Investasi uses carousel/grid. `variant="icon"` is a single phone app-bar button that switches to the next mode.
- **`BudgetProgressBar`**: the month bar. The fill tracks spending; the "Hari ini" pill and tick track the calendar. Props: `ratio`, `color` (`var(--expense)` once over), `tone="card" | "hero"`, and optional start/end dates (`datesClassName` hides them on phones).
- **`Popover`**: an anchored panel under its trigger from 640px up and a bottom sheet below. It closes on outside click or Escape. Used by Rentang tanggal and Urutkan.
- **`Modal placement="center"`**: keeps a centered card on phones. `AlertDialog` uses it, so confirms are never bottom sheets.
- **Modal footer**: shows its divider only while more content is scrolled below it.
- **`ChartTooltip`**: the one Recharts tooltip card (title + rows with a dot or line marker). It is used by the investment, cash flow and trend charts.
- **`DateRangeFields`** (exported from `layouts/transaction/DateRangeFilterPopover`): the Dari/Sampai fields plus the range calendar. Transaksi uses it for "Rentang tanggal" and Laporan for "Custom range".
- **Investasi blocks** (`layouts/investment`):
  - `ProfitLossPill`: "▲ 8,4%", or with `showAmount` "↗ +1.860.000 · 6,1%".
  - `MoneyAmount`: a small "IDR" followed by a big number.
  - `InvestmentAccountSummary`: the soft account card at the top of Tarik dana, Update nilai and Transfer.
  - `AmountInput`: a money field with a calculator button.
  - `InstrumentDetailView`: an in-page detail; its account cards can be multi-selected to drive the history chart.
- **`LoadingScreen`**: the brand loader (logo inside a spinning ring, "TosmFi · Memuat…"). `variant="full"` covers the viewport (route chunks, session boot); `variant="inline"` sits inside the app shell while a page chunk loads.
- **Pengaturan blocks** (`layouts/settings`):
  - `SettingsMenuLink`: one menu entry. `variant="card"` is the desktop grid card, `variant="row"` the phone list row. It takes an optional `badge` (e.g. "2 baru") and `shortDescription`.
  - `SettingsPanel`: a card with an icon tile, title and subtitle above its content. Mata Uang and Edit Profil use it.
  - `OptionRow`: a radio card (`leading`, `title`, `subtitle`, `isSelected`) for currency and decimal choices.
  - Each menu tone (`SETTINGS_TONE_CLASS` in `constants/settings-menu.ts`) colors its icon tile.
- **`AuthNotice`** (`layouts/auth`): the login/register banner. `tone="error"` is a failed login, `"warning"` an account still waiting for approval, and `"info"` an expired session or the approval note on Register.
- **Container queries** (`@container`, `@sm:`, `@xl:`): use them when a block must adapt to its card width rather than the viewport. Examples: `ScheduledTransactionRow`, `CategoryBreakdownChart`.

### Organisms and templates

- **Shell**: `Rail`, `BottomNav`, `MoreMenuSheet`, `UserMenu`, `ChatFab`, `LanguageSwitcher`.
- **`AppLayout`** (`components/templates/AppLayout`): the persistent layout route with page transitions. Pages must **not** wrap themselves in a layout; they render content only.
- **`AuthLayout`**: the split auth screen. The form is on the left. The right side is a gradient hero with sample preview cards, laid out at the design's 610×362 size and scaled to fit the panel. Phones get a compact hero band. `heroTitle` swaps the headline (Register uses its own).
- **`ErrorBoundary`** (`app/ErrorBoundary`): the "Ups, terjadi kesalahan" card with Coba Lagi and Muat Ulang.

### Helpers

- **`cn()`** is `tailwind-merge` configured with the Mist tokens, so a later or `className` class reliably overrides a conflicting base class (e.g. `text-text` → `text-expense-text`).
- **`useMoneyFormat()`** (`hooks/use-money-format.ts`) returns `symbol`, `format`, `formatNumber`, `formatCompact`, `formatSigned`, plus `AMOUNT_MASK`.
- **`utils/calendar.ts`**: `buildMonthWeeks` (Monday-first), `getWeekdayLabels`, `toIsoDate`, `parseIsoDate`, `formatShortDate`, `formatMonthYear`, `formatDayMonth` ("5 Okt"), `formatMonthName`. Every month grid uses these.
- **`toIntlLocale(language)`** (`utils/locale.ts`) is the only id/en/jp → Intl locale mapping. `formatDateTimeLabel()` (`utils/tx-time.ts`) gives "Hari ini · 08.42".
- **`useDialogSession(isOpen)`**: key a dialog's form with it. Each open then starts from fresh state, while the closing dialog keeps its content through the exit animation. Freeze props the parent clears on close with `useState(prop)`.

## 5. Page pattern

```tsx
export function WalletPage() {
  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <PageHeader
        title={t("wallet.title")}
        subtitle={…}
        actions={<Button leftIcon={<LuPlus />}>…</Button>}
        mobileActions={<IconButton size="lg" variant="primary" label=… icon={<LuPlus />} />}
      />
      <Reveal><Card>…</Card></Reveal>
      <Reveal delay={0.05}>…</Reveal>
    </div>
  );
}
```

- **Spacing**: section gap is 20 on phones and 24 on desktop, and grid gaps are 16. Pages get no outer padding, because the shell handles it.
- **Hero blocks** (net worth, investment total, budget/profile identity): `rounded-[28px] bg-gradient-to-br from-hero-bg to-hero-bg-2 p-6 lg:p-8`, text `hero-fg`.
- **Lists inside cards**: day header row (`HARI INI`, right-aligned day total), then rows.
- **Loading**: `Skeleton` blocks shaped like the content (the preferred pattern), or a centered `IconLoader className="animate-spin text-primary"` in a card.
- **Empty**: `EmptyState` with an icon, a message, and the primary action where it makes sense.
- **Error**: an inline `apyP9`-style banner (`bg-expense-soft text-expense-text rounded-control`), or a toast for transient errors.
- **Infinite scroll**: keep the existing sentinel `<div ref={sentinelRef}>` logic exactly. Only restyle the spinner.

## 6. Charts (Recharts)

Follow the "Grafik" section of 01 Design System.

- **Area / line**
  - `type="monotone"`, `strokeWidth={2.5}`, a gradient fill with `stopOpacity` 0.32→0.
  - `CartesianGrid vertical={false} stroke="var(--border)"`.
  - Axes have no lines; tick `fill: var(--text-3)` at 11px.
  - The tooltip is a custom card (`rounded-[14px] bg-surface shadow-pop border border-border`).
  - `activeDot r=7` with a `var(--surface)` stroke.
- **Colors**: income `var(--chart-1)`, expense `var(--chart-2)`, investment `var(--investment)`.
- **Bars**
  - `radius={[8,8,3,3]}`.
  - The current/active bar uses `var(--chart-2)` (or the metric color); the others use the soft color.
  - Value pill above the active bar: `bg-text text-surface`.
- **Donut**: `DonutChart` (cornerRadius 10, paddingAngle 3), with a center label in `font-num`.
- **Sparkline**: `AreaChart` with no axes, `isAnimationActive={false}`, stroke = the instrument/category color.
- **Gauge**: `RadialBarChart startAngle={180} endAngle={0}`, `cornerRadius 99`, with a background track.

## 7. Motion

| Where | How |
| --- | --- |
| Page change | Automatic (shell `AnimatePresence`). Don't add your own page-level wrapper. |
| Sections / cards on a page | `<Reveal delay={i * 0.05}>` (fade-up once in view) |
| Clickable cards / tiles | `Card interactive` or the `lift` utility |
| Buttons / chips / icon buttons | Built in (`pressable`: press scale + color transitions) |
| Row hover | `TxRowBase` (bg + tile scale) · other rows `transition-colors hover:bg-surface-2` |
| Toggles / tabs | `SegmentedControl` (sliding thumb) |
| Conditional panels / lists | `AnimatePresence` + `m.div` (opacity/y, 0.25–0.35s, ease `[0.22,1,0.36,1]`). Use `animate-fade-up` for simple CSS mounts and `layout` for reordering lists |
| Numbers | Optional `animate-fade-in` on change. Don't animate money with counters that delay reading |

Keep durations between 0.18s and 0.5s, and never block input.

## 8. Dark mode checklist

- No hard-coded colors (see rule 1). `color-mix(in oklab, var(--primary) 30%, transparent)` is fine for glows.
- Images and illustrations must read on both `bg` values.
- Check every page in both themes. The toggle lives in the rail avatar menu (desktop) and in Lainnya (phone).

## 9. Breakpoints

| Breakpoint | Behavior |
| --- | --- |
| `< 640` | Phone. Dialogs become bottom sheets. |
| `< 1024` | Phone/tablet shell: `PageHeader` app bar + bottom nav. Content gets 16/24px gutters; leave the bottom 120px clear (the shell already pads `main`). |
| `≥ 1024` | Desktop: rail + desktop `PageHeader`. Content max 1320px. |

## 10. Catat Cepat (AI)

- **Entry points**: `ChatFab` (desktop, bottom-right) and the center `BottomNav` button (phone). Both call `useQuickAdd().openAssistant()`. Manual entry is `openManualEntry()`, which opens the shell's `AddTransactionModal`.
- **UI** (`src/layouts/assistant/`):
  - `CatatCepat` is the container: a 440px floating right panel over a scrim from `lg`, full screen below that.
  - Parts: `ChatBubble` (`AiRow`, `AiBubble`, `UserBubble`, `TypingBubble`, `ChatEntry`), `QuickReplyButton`, `AssistantPreviewCard` (rows via `TxRowBase`), `AssistantErrorBanner` (quota/network), `ChatComposer`.
- **State**: `hooks/use-assistant-chat.ts`. It sends the conversation, the pending drafts, the language and whether a preview is on screen to `POST /assistant/chat` (`{ intent, reply, drafts, quickReplies? }`). A confirmed preview (Simpan, or a typed "ok, catat") goes to `POST /assistant/commit`, which saves the whole batch in one database transaction; the hook then dispatches `addTransaction` / `addInvestmentTransaction` and resyncs wallets, categories and instruments, like a manual entry.
- **Service**: `services/assistant.service.ts`. A 429 means the free AI quota is full or the model is overloaded (`quota` banner); anything else is `network`. A rejected commit names the failing draft (`AssistantCommitError.idDraft`) and that row turns red.
- **Preview rows** follow the list they will land in: wallet kinds look like the Transaksi list, investment kinds like the investment ledger (top up +, tarik −, transfer neutral, update nilai ±). The footer total is the net effect on wallets only.

## 11. Design frames (pen IDs)

Screenshot frames with the pencil MCP: `TakeScreenshot(["<id>"])` on `../design/tosmfi-redesign.pen`. This is **read-only**; never edit the design file.

### Pages

| Area | Desktop | Phone |
| --- | --- | --- |
| Design System | `SzSDf` (foundations, charts) | `XlPND` (components) |
| Login | `H36i8J` | `w7RD5` |
| Register | `IBn7Y` | `kkOoB` |
| Dashboard | `JPqdK` (`D7MIjZ` dark) | `yHRM4` (`kUFIm` dark) |
| Transaksi | `vT32V` | `PIoO4` |
| Transaksi · Filter aktif | `uHXiT` | `z5AbmD` |
| Dompet | `ppCFx` | `cnoOe` |
| Dompet · Tampilan list | `e5BX5` | `YYZ1Z` |
| Dompet · Atur urutan | `gjx9Z` | `PWG8l` |
| Dompet · Kosong | `c3xwEy` | `ZcRnk` |
| Kategori | `GU99x` | `auPuW` |
| Kategori · Atur urutan | `mV7BO` | `y0vxv` |
| Kategori · Kosong | `kdeMr` | `ZVCxG` |
| Jadwal | `eCKbu` | `a0SVGi` |
| Jadwal · Kosong | `GTCI9` | `go3lT` |
| Budget | `mM2GT` | `Lu9SC` |
| Budget · Detail | `QpyCj` | `NFM3f` |
| Budget · Kosong | `V05rY` | `JqSyG` |
| Investasi | `N9zyS` | `Q1BjKl` |
| Investasi · Detail | `ukwo7` | `Dn41X` |
| Investasi · Kosong | `Ngu2b` | `dZKTE` |
| Laporan | `t8Er08` | `S5YW9` |
| Laporan · State | `X9uRZ` | `CaSg9` |
| Edit Profil | `o5B96I` | `S5xzK` |
| Pengaturan | `UiVJQ` | `k0SKz` |
| Mata Uang | `fdhzj` | `TPJ9e` |
| Backend API | `Z68aD5` | `y12zG` |
| Permintaan Pengguna | `y3gvX7` | `DaxsW` |
| Log Error | `I0lAG` | `IMPbc` |
| Menu Lainnya | — | `TRDlX` |
| Toast | `L8Ehi` | `vFxAJ` |
| Layar Error | `lVbWZ` | `KG1bZ` |
| Loading | `Ffkce` | `WG5B9` |

Catat Cepat (14) has 16 state groups; see `CC · …` frames.

### Popups (Desktop / HP)

| Area | Popups |
| --- | --- |
| Transaction | Catat transaksi `WE1C8`/`C4Bk35` · Transfer `wslSN`/`DcLW7` · Edit transaksi `S6jhe8`/`z5FDD` · Pilih kategori `fBvIY`/`DSIav` · Pilih subkategori `aYa9b`/`c2WsJ` · Kalkulator `dVyK7`/`U0tbU` · Tanggal & jam `uSleB`/`k2oQp` · Catat ke investasi `hj6Bp`/`C4brtg` · Rentang tanggal `Q9imr`/`TtzF7` · Urutkan `Zwttj`/`qFQeP` |
| Wallet | Koreksi saldo `iD9m2`/`kdRVQ` · Tambah dompet `QwUKE`/`KiasV` · Edit dompet `haZQv`/`nrR3J` · Warna custom `J1p1UT`/`yRiTX` · Hapus dompet `KUZ0D`/`GDBqu` |
| Schedule | Bayar tagihan `oh3dk`/`U7rLyW` · Batal tagihan `R35G6E`/`WaYzd` · Tambah jadwal `k8ScNK`/`nHHvn` · Edit jadwal `wySzs`/`W9TVu` · Tanggal mulai `GGQNL`/`G6xy19` · Hapus jadwal `bltDU`/`KSoo2` |
| Category | Tambah kategori `dMaUO`/`gyYoq` · Edit kategori `j1Dy8`/`Fuwp0` · Pilih ikon `IpnYF`/`o8mD9` · Edit subkategori `lvuU2`/`XqmP6` · Hapus kategori `Hv7JE`/`fjWxZ` |
| Budget | Tambah budget `Y73Rn7`/`O98YEF` · Pilih kategori budget `ilFHx`/`Jt53V` · Atur limit `z4dnXT`/`R4Ro9g` · Hapus budget `HWqTM`/`A4B0e2` |
| Investment | Edit instrumen `QFeau`/`WTcV3` · Tambah akun `pcI8a`/`o12ZPM` · Tarik dana `YjU05`/`p6ZH8` · Transfer antar akun `uA3Md`/`JdZov` · Update nilai `w9Cw8`/`pJ1a2` · Edit transaksi investasi `Mw9oN`/`ngkTb` · Pilih instrumen `yZIVz`/`Scg3T` · Pilih akun `REvjg`/`Iyrbl` · Urutkan instrumen `pY0bU`/`CNNda` |
| Report | Export `iT04F`/`MVyzc` · Custom range `fbBV8`/`xBWFe` |
| Profile & settings | Menu pengguna `LX0e0` · Simpan profil `VQuIW`/`eCXQt` · Keluar `JHIpx`/`PlMkh` · Reset data `cFztB`/`H9Gnu` · Hapus log `uZgid`/`PdN9s` |
