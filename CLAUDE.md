# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server (port 5173, or $PORT)
npm run build     # tsc -b (type-check via project references) then vite build
npm run lint      # eslint .
npm run preview   # preview the production build
```

There is no test suite/framework configured in this project.

## Architecture

TosmFi is a React 19 + TypeScript + Vite money-tracking app. **Auth, wallet, category, and transaction are wired to a real backend; report/settings are still mocked.** All non-backed data lives in Redux (persisted to `localStorage` via `redux-persist`), and every "API call" for those entities is a service function that awaits a fake `delay()` and returns/mutates mock data (seeded from empty arrays in `src/constants/mock-*.ts` — deliberately emptied, not deleted, so the seam stays obvious for whoever builds the real backend next). `src/constants/api-docs.ts` is not just documentation — it's the living spec of every endpoint the mock layer already emulates (or, for the "auth", "wallet", "category", and "transaction" groups, the real contract already implemented), rendered at Settings → Backend API for whoever builds the rest of the real backend later.

### Real backend integration (auth + wallet + category + transaction)

The sibling repo `../tosm-fi-be` (Express/Mongoose, see its own `CLAUDE.md`) implements `/auth/{register,login,logout}`, `/user/{me,get-list-user,accept-user}`, `/wallets/{"", ":idWallet", ":idWallet/primary", "reorder"}`, `/categories/{...}`, and `/transactions/{"", ":idTransaction"}` (see below) for real, at `http://localhost:3000/api`. Nothing else (report/settings) has a real backend yet — don't assume the pattern below extends to those until they're actually built.

- `src/services/wallet.service.ts`, `src/services/category.service.ts`, and `src/services/transaction.service.ts` call the real endpoints the same way `auth.service.ts` does (try/catch around `httpClient`, `getApiErrorMessage` for the error message) — no `delay()`, no mock array. `useWallets()`/`useCategories()`/`useTransactions()` didn't need to change shape at all: they still just compose service + slice, same as every mocked entity's hook.
- Category's backend embeds subcategories directly in the category document (not a separate collection) — matches the FE's nested `Category.subCategories: SubCategory[]` shape exactly, and means deleting a category cascades to its subcategories for free. Reorder endpoints exist at both levels: `/categories/reorder` (categories among themselves) and `/categories/:idCategory/subcategories/reorder` (subcategories within one category).
- `balance`/`transactionCount` (wallet) and `transactionCount` (category/subcategory) are owned by their respective backends but are **only ever mutated by the transaction backend**, atomically, inside the same Mongoose session transaction as the transaction write itself — see `tosm-fi-be`'s `transaction.service.ts` and its `CLAUDE.md` "Transaction domain" section. Because the backend now owns this, `src/hooks/use-transactions.ts` no longer computes wallet/category deltas client-side (that logic — `getWalletDeltas`/`accumulateWalletDeltas`/`buildWalletUpdate`/`buildCategoryUpdate` — was removed); it just calls `loadWallets()`/`loadCategories()` again after any create/edit/delete to resync the now-authoritative numbers from the server.
- `GET /transactions` always returns a `summary` alongside `transactions` — `{ income, expense, net, categoryBreakdown }`, aggregated server-side (Mongo `$group`) over the *entire* filtered set (every query param except `page`/`limit`), never just the current page. `categoryBreakdown` nests each expense category's own `subCategoryBreakdown`. This is what feeds `TransactionSummaryBar` (Transactions page) and `CategoryBreakdownChart` (Dashboard, via `ExpenseByCategoryChart`) — neither component reduces a raw transaction array anymore. `CategoryBreakdownChart` is now purely presentational (takes a `slices: CategorySlice[]` prop); Reports still builds that same shape client-side from its own custom-period `expenseTransactions` via `src/utils/category-breakdown.ts`'s `buildCategoryBreakdown()`.
- `transaction.service.ts` has a single read path, `queryTransactions(params)` → `GET /transactions` (all params optional; omitting `page`/`limit` returns the whole filtered set unpaginated with `page/limit/totalPages: null`). Every consumer fetches only the scoped window it needs into its own local component/hook state — results never touch the global slice. `TransactionsPage` queries filtered/sorted/paginated; `DashboardPage` queries just the current month; `use-reports.ts` queries an unpaginated `{ dateFrom, dateTo }` window covering exactly what the still-mocked report computations read (the resolved period, its previous-period comparison span for `fetchSummary`, and the 12-month `fetchMonthlyTrend` range — Reports is planned to get its own report API later; this scoped window is the interim). **Nothing fetches the entire unpaginated history anymore** — the old `fetchTransactions()`/`loadTransactions()` full-history path was removed deliberately to save bandwidth; don't reintroduce it, transaction volume only grows over time. The `transaction` Redux slice still exists but purely as an app-wide mutation signal: its array is fed solely by `add/update/removeTransaction` after create/edit/delete, is never seeded from the server, has no `status` field, and is not persisted.
- `TransactionsPage` resets its `page` state to `1` whenever its filters change **or** whenever the global `transactions` array reference changes (i.e. after any create/edit/delete anywhere in the app) — so its accumulated list can never go stale or duplicate after a mutation. The reset happens by adjusting state **during render** (the `prevFilterKey`/`prevTransactions` state pair), not in an effect, so the query effect only ever sees the final page — no wasted intermediate request; a `refreshToken` baked into `queryKey` forces the refetch even when the page is already `1`. `DashboardPage` uses the same `transactions`-reference-as-change-signal trick (its own effect is keyed on `[queryTransactions, transactions]`) even though it never renders that array directly. Pagination itself is infinite scroll, not a button — an `IntersectionObserver` on a sentinel `<div>` at the bottom of the list advances `page` once it's within `200px` of the viewport.

- `src/services/http-client.ts` — a single axios instance every real call goes through. Its request interceptor attaches `Authorization: Bearer <token>` from the Redux store automatically; its response interceptor watches for `401` and, **only if the session was already logged in** (not a wrong-password 401 from the login call itself), dispatches `onSessionExpired()` — auto-logout on an invalid/expired/revoked token, with no explicit call site needed anywhere else.
- `src/services/auth.service.ts` calls the real endpoints. `src/hooks/use-auth.ts`'s `login()` calls `authService.login()` then immediately `authService.getMe()` — `onLogin` only dispatches if **both** succeed. This is what blocks a not-yet-approved (`pending`) user: login succeeds and returns a token, but `/user/me` 403s with "Menunggu validasi", so the user is never actually signed in even though a token exists momentarily.
- `authenticationSlice` has a `sessionExpired` flag, distinct from a normal `onLogout` — set only by the interceptor's auto-logout path. `LoginForm` reads it once, shows it as the existing red error banner ("Sesi kamu telah berakhir..."), then dismisses it via `onDismissSessionExpired` so it doesn't reappear on a later visit.
- `logout()` calls the real `/auth/logout` best-effort (wrapped in try/catch) and always clears local state in a `finally` — a dead token or network error should never trap the user in a logged-in-looking-but-broken state.
- `AuthUser` fields are camelCase matching the backend exactly: `idUser`, `nameUser`, `username`, `role`, `status`. `netWorth` is optional and currently always absent — the backend doesn't compute it (that's a wallet-aggregation concern, not implemented yet); `Topbar` already falls back to `?? 0`.
- The backend's response envelope is `{ message, data, isSuccess, status }` (not `{ success, ... }`) — reflected in `api-docs.ts`'s "auth", "wallet", "category", and "transaction" group examples specifically, since those groups are real now. Every *other* group in that file still shows the old mock's `{ success, ... }` shape on purpose — don't "fix" those to match until their backend actually exists, and don't copy the real envelope into a new mocked entity either.

### The core pattern — follow it for every new data-owning feature

Every entity (wallet, category, transaction, settings, auth) is wired the same five-part way. When adding a new feature that owns data, replicate all five parts — skipping the api-docs entry or the service seam is the most common way this codebase drifts out of "backend-ready":

1. **Type** — `src/types/<entity>.types.ts`: the entity shape plus an `Input` type for create/update payloads (e.g. `TransactionInput = Omit<Transaction, "idTransaction">`).
2. **Service** — `src/services/<entity>.service.ts`: async functions that `await delay()` and read/write an in-memory mock array (`src/constants/mock-*.ts`). This is the seam where real `fetch()` calls get dropped in later — no component or hook should touch mock data directly.
3. **Redux slice** — `src/redux/slices/<entity>Slice/index.ts`: holds the entity list/object plus a `status: "idle" | "loading" | "loaded"` field, with reducers like `set<Entity>Loading`, `set<Entity>`, `add<Entity>`, `update<Entity>`, `remove<Entity>`. Re-export from `src/redux/slices/index.ts`. (The oldest slice, `authenticationSlice`, uses `onLogin`/`onLogout`/`onSetToken` naming instead — new slices should follow the newer `set*`/`add*`/`update*`/`remove*` convention, not that one.)
4. **Hook** — `src/hooks/use-<entities>.ts`: composes service + slice (`load<Entities>` dispatches loading then the service result; mutating methods call the service then dispatch the result). Components never call services or dispatch slice actions directly — always through the hook.
5. **API doc entry** — add the endpoint (method, path, payload fields, success/error JSON examples) to the matching group in `src/constants/api-docs.ts`, and add an `apiDoc.groups.<key>` string to all three `src/helpers/lang/*.json` files.

Reference implementation to copy from, for a still-mocked entity: settings (`settings.types.ts` → `settings.service.ts` → `settingsSlice` → `use-settings.ts` → "settings" group in api-docs.ts). For a richer, now-real entity showing how a `type`-discriminated payload works: transaction — `Transaction.type` is `"income" | "expense" | "transfer" | "correction"`, and `idWallet`/`idCategory`/`idSubCategory`/`idWalletFrom`/`idWalletTo` are all nullable because which ones apply depends on `type` (transfer uses `idWalletFrom`/`idWalletTo` instead of `idWallet`; transfer/correction have no category) — but note its wallet-balance/category-count side effects are now computed **backend-side**, not in `use-transactions.ts` (see above), so it's not a template for how a still-mocked entity's hook should look.

### Redux persistence and the settings exception

`src/redux/store.ts` combines all slices into one `persistReducer` with a single `whitelist` array — there is no per-slice persist config. When adding a slice that should survive reloads, add its key to that `whitelist`.

For slices backed by a real API (`wallet`, `category`), a `createTransform` resets `status` back to `"idle"` on every rehydrate — otherwise a persisted `"loaded"` status would make every consumer's `if (status === "idle") load…()` guard skip refetching after a reload, showing indefinitely-stale data (a previous account's data, or changes made directly via the API). Add the same transform for a slice once its backend goes real.

`settingsSlice` (currency, decimal places, language) is the one place this gets subtle: `src/helpers/i18n.ts` calls `i18n.init()` at module-load time, before React (and therefore Redux/`PersistGate`) has mounted, so it can't read the persisted Redux state yet. It reads a raw `localStorage` key (`LANG_STORAGE_KEY`) directly instead. `src/services/settings.service.ts` writes to that same raw key whenever `language` changes, in addition to the normal Redux round-trip, so the next page load's `i18n.init()` sees the current language before Redux rehydrates. `useCurrency()` and `useLanguage()` are both thin wrappers around `useSettings()` that preserve their pre-Redux public API (`{ currency, setCurrency, decimalPlaces, setDecimalPlaces, format }` / `{ language, changeLanguage }`) — no consumer needed to change when these moved off plain `localStorage`.

Preferences that are genuinely local-only and not meant to sync to a future backend (theme light/dark, wallet grid/list view mode) intentionally stay outside Redux, reading/writing `localStorage` directly via their own hook (`use-theme.tsx`, `use-wallet-view-mode.ts`).

### Component layers

- `src/components/atoms/`, `molecules/`, `organisms/`, `templates/` — generic, feature-agnostic UI primitives (atomic design). `Words` is the text primitive (use it instead of raw `<p>`/`<span>` for anything user-facing so type scale/weight stay consistent); `Modal` is the shared dialog shell every feature modal wraps.
- `src/layouts/<feature>/` — composite, feature-specific components (e.g. `layouts/transaction/AddTransactionModal`, `layouts/wallet/BalanceCorrectionModal`). This is where most feature work happens; `src/app/pages/*Page` components stay thin and mostly just wire hooks to layout components.
- Amount entry (calculator-style keypad with `+ - × ÷`, keyboard input, and an expression preview) is shared via `src/hooks/use-amount-calculator.ts` + `src/components/molecules/AmountCalculatorKeypad`, reused by both `AmountCalculatorModal` (transaction amount) and `BalanceCorrectionModal` (new balance).

### Routing and auth gating

Routes are centralized in `src/constants/routes.ts` (`ROUTES`) and wired in `src/app/AppRouter/index.tsx`. Every route except `/login` is wrapped in `src/app/ProtectedRoute/index.tsx`, which redirects to `/login` when `useAuth().isAuthenticated` is false — there's no route-level code splitting or nested layouts beyond that single gate.

### Styling

Tailwind v4, configured entirely in CSS (`src/css/index.css`) via `@theme` — there is no `tailwind.config.js`. Custom color tokens (`primary-*`, `ink-*`) and the font face are defined there. Dark mode is a class variant (`@custom-variant dark (&:where(.dark, .dark *))`) toggled by `use-theme.tsx` adding/removing a `.dark` class, not a media query — always pair `dark:` classes rather than relying on `prefers-color-scheme`.

### i18n

Three languages — `id` (default/fallback), `en`, `jp` — as flat-key JSON files in `src/helpers/lang/`. Every user-facing string goes through `useTranslation()`'s `t()`; when adding a string, add the same key to all three files in the same position (existing files are kept in sync key-for-key, not just per-language supersets).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
