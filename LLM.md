# longform-essays — agent notes

A minimalist personal essay blog on the canonical Hanzo stack: Vite + React 19 +
`@hanzo/gui` (UI) + `@hanzo/iam` (auth) + `@hanzo/base` (data). Forked from
`hanzo-apps/hanzo-starter`; the provider stack, `vite.config.ts`, auth, and
deploy contract are the starter's and stay identical. Keep it REAL — every
surface must build and run, no fabricated UI.

## What this app is

- Three views, no router: `contents` (year-grouped index) → `reader`
  (distraction-free column) → `editor` (title/subtitle/markdown + publish
  toggle). `src/views/home.tsx` is a small state machine that swaps between them.
- Data is the `essays` collection (see `schema.sql` + `src/lib/essays.ts`).
  `collections` + `essay_collections` are provisioned for series grouping.
- Design is warm-paper editorial: cream sheet, book serif, one narrow reading
  measure (~66ch), drop-cap opening, footnote-gray metadata. Palette is one place
  (`src/lib/theme.ts`).

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (unchanged
  from the starter): (1) alias `react-native` → `react-native-web`, (2) `define`
  `process.env.TAMAGUI_TARGET` / `NODE_ENV` / `__DEV__`, (3) `dedupe`
  react/react-dom/react-native-web. No `@hanzogui/vite-plugin`.
- **`@hanzo/gui` props are Tamagui LONGHAND**: `alignItems`/`justifyContent`/
  `backgroundColor`/`padding`/`alignSelf`/`borderRadius`/`textAlign` — NOT the
  `items`/`justify`/`bg`/`p`/`self`/`rounded`/`text` shorthands. Shorthands pass
  at runtime but FAIL `tsc`. `Button` uses `onPress`; `Input`/`TextArea` use
  `value`/`onChangeText`.
- **Serif + drop-cap live in `index.html`**, not props. `fontFamily` as a raw
  string is not a valid gui prop (it wants a font token), and `::first-letter`
  has no style-prop equivalent — so the book serif (`#root, #root *`) and the
  drop-cap (`.lf-drop`) are one small id-scoped CSS block. Everything else
  (colour, spacing, size, weight, leading) is Tamagui longhand props. This is the
  app's typography, not a second UI kit.
- **Colours are raw hex** from `src/lib/theme.ts` on `color`/`backgroundColor`/
  `borderColor` (Tamagui accepts arbitrary colour strings). One place for the
  palette.
- **Auth reads `VITE_IAM_CLIENT_ID`** (fallback `hanzo-app`) in `src/env.ts`.
- **PKCE storage is `localStorage`** so the verifier/state survive the hanzo.id
  round-trip.
- **`schema.sql` is the data contract** (`provisionBaseFromDDL`). Keep it in
  lockstep with `src/lib/essays.ts`.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app`. No server.
- On publish, `schema.sql` → Base collections (org-scoped, IAM-native,
  `@request.auth.org_id = org`). Runtime read/write is browser →
  `VITE_HANZO_BASE_URL` with the IAM token.
- **IAM redirect registration** is the one external requirement: the client
  (`VITE_IAM_CLIENT_ID`) must allow this origin's `/auth/callback`.

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys; do not build images locally).
