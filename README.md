# Longform — A Home for Your Writing

Words first. Everything else second.

Longform is a real, buildable Hanzo app: a minimalist personal essay blog you
fork on [hanzo.app](https://hanzo.app) and deploy live on Hanzo Cloud. Write long
reads, publish them, and give readers a distraction-free reading column with an
honest reading-time estimate and an index of everything you've written, by year.

- **UI** — [`@hanzo/gui`](https://www.npmjs.com/package/@hanzo/gui) (the Hanzo
  design system) under Vite + React 19. No second UI kit, no Tailwind — set like
  a book page in a warm-paper editorial palette.
- **Auth** — [`@hanzo/iam`](https://www.npmjs.com/package/@hanzo/iam), OAuth2
  **PKCE** against [hanzo.id](https://hanzo.id). No local passwords — IAM owns
  every credential interaction.
- **Data** — [`@hanzo/base`](https://www.npmjs.com/package/@hanzo/base), the
  IAM-native, org-scoped data plane. Your essays are real Base rows, private to
  your org until you publish.

## The three views

- **Index** — a table of contents. Drafts gather at the top while you write them;
  published essays fall under a year marker, newest first. Each row shows the
  title, an optional subtitle, and a footnote-gray date + reading time.
- **Reading** — a single narrow column (~66ch) set in a book serif with generous
  leading, a drop-cap on the opening paragraph, and quiet metadata.
- **Editor** — title, subtitle, and a markdown body, with a live word / reading
  estimate and a Draft ⇄ Published toggle.

## Stack (pinned)

| Package | Version |
| --- | --- |
| `react` / `react-dom` | `^19.2.4` |
| `@hanzo/gui` + `@hanzogui/config` | `7.3.0` |
| `@hanzo/iam` | `^0.13.1` |
| `@hanzo/base` | `^0.2.1` |
| `vite` | `^6` (`@vitejs/plugin-react`) |
| `react-native-web` | `^0.21.0` |
| `typescript` | `5.9.3` |

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build  ->  dist/
npm run preview    # serve the production build (SPA fallback on)
```

Out of the box it runs against **live** Hanzo (hanzo.id + api.hanzo.ai) — no
config needed to see the landing + sign-in flow. Copy `.env.example` to `.env`
to point at a different environment.

## Environment contract

Only `VITE_`-prefixed vars reach the browser (this is a static SPA — there is no
server). Defaults in parentheses.

| Var | Purpose |
| --- | --- |
| `VITE_HANZO_IAM_URL` (`https://hanzo.id`) | OIDC issuer. |
| `VITE_IAM_CLIENT_ID` (`hanzo-app`) | IAM application (`<org>-<app>`). Its redirect-URI list must allow this deploy's `/auth/callback`. The deploy provisions a per-app client. |
| `VITE_HANZO_REDIRECT_URI` (`${origin}/auth/callback`) | PKCE redirect. |
| `VITE_HANZO_BASE_URL` (`https://api.hanzo.ai`) | Browser-reachable Hanzo Base data plane. Deploy injects the provisioned URL. |

## How auth works — ambient IAM

`login()` starts an OAuth2 **PKCE S256** redirect to hanzo.id; hanzo.id returns
to `/auth/callback`, where `handleCallback()` exchanges the code for tokens
(stored in `localStorage`, refresh-aware via `offline_access`). Every deployed
app is a static site at `<slug>.hanzo.app`; there is **no server token** — the
SPA authenticates the user in the browser and carries the resulting IAM JWT to
Base. The client id is read from `VITE_IAM_CLIENT_ID` (fallback `hanzo-app`).

## How data works — Base from `schema.sql`

[`schema.sql`](./schema.sql) is the app's `databaseSchema` (SQL DDL). On publish,
Hanzo Cloud translates each `CREATE TABLE` into a Hanzo Base collection
(`provisionBaseFromDDL`, additive + idempotent). Base manages
`id`/`created`/`updated`, stamps `owner`+`org` from the verified IAM principal,
and scopes every row to the caller's org (`@request.auth.org_id = org`) — a
teammate in your org sees the row; other orgs cannot. At runtime the views
read/write the `essays` collection through `@hanzo/base/react`
(`useQuery`/`useMutation`) carrying the IAM token. `collections` +
`essay_collections` are provisioned for grouping essays into series.

## Deploy — Hanzo Cloud

[`hanzo.yml`](./hanzo.yml) declares a static build (`npm run build` → `dist/`,
served at `<slug>.hanzo.app`) plus the Base schema to provision and the env to
inject. Do **not** build a container image locally — Hanzo Cloud owns builds and
deploys. CI here only proves the template compiles green.

## Layout

```
src/
  main.tsx          entry
  providers.tsx     GuiProvider -> IamProvider -> BaseProvider(client=IAM-token)
  app.tsx           route (/auth/callback) + auth gate
  gui.config.ts     createGui(defaultConfig from @hanzogui/config/v5)
  iam.config.ts     IAM PKCE config
  env.ts            the VITE_ env contract, one place
  lib/
    theme.ts        the warm-paper palette, one place for colour
    essays.ts       Essay type + reading-time, year-grouping, markdown blocks
    base.ts         BaseClient carrying the IAM bearer token
  auth/callback.tsx PKCE return leg
  views/
    landing.tsx     signed-out title page (the public thumbnail)
    home.tsx        signed-in desk: masthead + view state machine
    contents.tsx    the essay index (drafts + year markers)
    reader.tsx      the reading column (drop-cap, markdown blocks)
    editor.tsx      title/subtitle/body + publish toggle
schema.sql          databaseSchema -> Base collections on publish
hanzo.yml           Hanzo Cloud build/deploy manifest
```
