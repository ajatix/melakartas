# Melakartas in Carnatic Music

A React + TypeScript app to explore the 72 Melakarta ragas: dials (M, R–G, D–N), interactive piano with scale highlighting, Arohanam/Avarohanam playback, and settings (tempo, reverb, transpose, instrument).

## Stack

- **Vite** – build and dev server
- **React 18** + **TypeScript**
- **Zustand** – state (raga, settings, UI) with persistence for settings
- **Tailwind CSS** + **shadcn-style** components (Button, Input, Slider, Sheet, Label)
- **Vitest** + **Testing Library** – tests for data, stores, and components

## Commands

```bash
npm install
npm run dev      # start dev server
npm run build    # type-check + production build
npm run preview  # serve production build
npm run test     # run tests in watch mode
npm run test:run # run tests once
```

## Structure

- `src/data/` – Melakarta data, types, and helpers (`melakarta.ts`, `types.ts`)
- `src/store/` – Zustand stores: `ragaStore`, `settingsStore`, `uiStore`
- `src/hooks/useAudio.ts` – Web Audio API (instruments, reverb, scale playback)
- `src/components/` – UI: Header, RagaCombobox, DialsSection, PianoSection, RagaDescription, RandomRagaButton, SettingsSheet, AudioUnlockOverlay
- `src/components/ui/` – shadcn-style primitives (Button, Input, Label, Slider, Sheet)

## Original

Converted from a vanilla HTML/CSS/JS app (`index.html`, `styles.css`, `app.js`, `data.js`). Original files are kept in the repo for reference; the app now runs entirely from the Vite/React entrypoint.

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds the Vite app and deploys it to GitHub Pages on every push to `main`.

1. In the repo: **Settings → Pages → Build and deployment**: set **Source** to **GitHub Actions**.
2. Push to `main` (or run the workflow manually from the **Actions** tab). The site will be at `https://<owner>.github.io/<repo>/`.

If your default branch is `master`, edit the workflow and change `branches: [main]` to `branches: [master]`.
