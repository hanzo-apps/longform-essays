# Agent guide

Canonical instructions for this repo live in [`LLM.md`](./LLM.md) (and its
`CLAUDE.md` symlink). Read it before changing anything.

TL;DR: Longform is a minimalist essay blog on Vite + React 19 + `@hanzo/gui` +
`@hanzo/iam` + `@hanzo/base`. Three views (index · reading · editor), no router.
Keep it minimal and real. `@hanzo/gui` needs the react-native-web alias + Tamagui
defines in `vite.config.ts` and uses Tamagui LONGHAND props (tsc enforces this).
The book serif + drop-cap live in one small CSS block in `index.html`; colour is
`src/lib/theme.ts`. `schema.sql` is the Base data contract. Prove changes with
`npm run build` (tsc + vite). Never build a container image locally — Hanzo Cloud
owns deploys.
