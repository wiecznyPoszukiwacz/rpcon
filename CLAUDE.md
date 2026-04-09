# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is rpcoon

An interactive terminal UI (TUI) client for JSON-RPC 2.0. Users write params in YAML, rpcoon converts to JSON for the wire and displays responses as YAML. Built with React/Ink for the terminal rendering, with vim-style `:` command line and keyboard-driven navigation.

## Commands

```bash
npm run build          # tsc → dist/
npm run start          # build + run
npm run dev            # tsc --watch
npm run typecheck      # tsc --noEmit (no output, type errors only)
npm run test           # build + node --test on dist/**/*.test.mjs
```

Run the app: `node dist/index.mjs <url>` (after build).

No linter is configured. No test framework beyond Node's built-in `node --test`.

## File conventions

- Source files use `.mts` (pure TypeScript) and `.tsx` (React/Ink components)
- Imports use `.js` / `.mjs` extensions (TypeScript ESM with `NodeNext` module resolution)
- Tabs for indentation
- Types are prefixed with `T` (e.g. `THooks`) per project convention

## Architecture

**Entry point:** `src/index.mts` — parses CLI args, loads hooks file, resolves URL, mounts `<App>`.

**Main component:** `src/app.tsx` — monolithic component holding all application state (`AppState`) and keyboard input handling via Ink's `useInput`. All modal states (history, method popup, params editor, command line, request picker, help) are managed here with useState.

**Transport layer** (`src/transport/`):
- `types.mts` — `Transport` interface (strategy pattern for future WebSocket/TCP/Unix transports)
- `http.mts` — `HttpTransport` implements `Transport` using native `fetch`, runs hooks before/after requests

**RPC client:** `src/rpc/client.mts` — `RpcClient` wraps a `Transport`, builds JSON-RPC 2.0 request objects, tracks history entries.

**Components** (`src/components/`): Ink/React components for each UI element — panels, popups, status bar, autocomplete. Components receive theme via `ThemeContext`.

**Theme system:** `src/theme.mts` defines built-in themes (defaultTheme, ayuMirageTheme, nordTheme). `src/ThemeContext.tsx` provides React context. The `Theme` interface in `src/types.mts` is comprehensive — every UI element has named style slots.

**Utilities** (`src/utils/`):
- `yaml.mts` — YAML↔JSON conversion using the `yaml` package
- `cursor.mts` — cursor movement/editing helpers for the inline params editor
- `requestFiles.mts` — scan/save `*.rpcoon.yaml` request files from the working directory

**Commands:** `src/commands.mts` — defines all `:` command-line commands with abbreviation resolution.

**Hooks system:** Users place `hooks.rpcoon.mjs` in the working directory. Hooks can provide `baseUrl`, `apiName`, `beforeRequest`, `afterResponse`. Hot-reloadable via `:hooks` command.

## Key design decisions

- The app opens `$VISUAL` / `$EDITOR` / `nvim` (fallback) synchronously via `spawnSync` for complex editing — raw mode is toggled off/on around editor spawns
- No external test framework or linter — tests use Node's built-in test runner
- Single `App` component manages all state — no state management library
- The `yaml` package is the only non-Ink runtime dependency
