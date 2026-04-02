# Changelog

## [0.9.0] - 2026-04-02

### Added
- `apiName` hook export — string or function; shown in the header instead of the raw URL, hot-reloaded alongside other hooks
- `?` key opens a keyboard shortcut help overlay anchored to the bottom-right corner
- Command-line argument completions: `:load <tab>` completes request file names (with method as secondary hint); `:method <tab>` completes from method names found in all request files
- Command abbreviations: any unambiguous prefix resolves to the full command (`:w` → `:write`, `:q` → `:quit`, etc.)
- `:write [filename]` — replaces `:save` / `:saveas`; saves to current file or to a named file
- `:load <filename>` — loads a request file by name directly from the command line
- `:new` — clears method, params and the loaded-file reference
- `:method <name>` — sets method directly without opening the picker when a name is supplied

### Changed
- Header bar gains a background colour and loses the separator line beneath it
- Status bar redesigned: loaded file name (with dirty indicator `●`) on the left; `?` and `:` hints on the right in white
- Command completion popup is wider (72 cols) and rendered without a border
- `Ctrl+S` / `Ctrl+W` shortcuts removed in favour of `:write` / `:write <filename>`
- File name moved from the header bar to the status bar

## [0.8.0] - 2026-04-02

### Added
- Vim-style command line: press `:` to open a command prompt at the bottom of the screen
  - Autocomplete popup floats above the status bar, showing matching commands with descriptions
  - `↑`/`↓` navigate suggestions, `Tab` fills selected suggestion, `Enter` executes, `Esc` cancels
  - Available commands: `send`, `method`, `params`, `nvim`, `view`, `viewraw`, `requests`, `history`, `save`, `saveas`, `hooks`, `quit`
- `src/commands.mts` — command definitions and `filterCommands()` helper
- `src/components/CommandCompletionPopup.tsx` — absolute-positioned completion overlay
- `commandLine` theme section added to all three built-in themes (default, ayu-mirage, nord)
- `CommandDef` type added to `types.mts`

## [0.7.0] - 2026-04-02

### Added
- `*.rpcon.yaml` request files — named, reusable requests stored on disk
  - Format: `name` (optional), `method`, `params` (object/array, optional)
  - Scanned from the current working directory at startup and on `Space`
- `Space` — open request picker popup (two-column: list on the left, preview on the right)
- `Ctrl+S` — save method/params back to the currently loaded file (overwrite); triggers save-as when no file is loaded
- `Ctrl+W` — save-as: prompts for a filename in the status bar, appends `.rpcon.yaml` automatically
- Dirty indicator: `●` shown in the top info bar when method or params differ from the loaded file
- `src/utils/requestFiles.mts` — scan, parse, serialise, and save `*.rpcon.yaml` files
- `src/components/RequestPickerPopup.tsx` — absolute-positioned two-column overlay
- `requestPickerPopup` theme section added to all three built-in themes (default, ayu-mirage, nord)

## [0.5.0] - 2026-03-29

### Added
- Built-in themes: `ayu-mirage`, `nord` (in addition to `default`)
- `themes` record exported from `src/theme.mts` — lookup by name
- Theme system: `Theme` interface in `src/types.mts` with typed styles for every visual element
  - `TextStyle` — spreads directly onto ink `<Text>` (color, backgroundColor, dimColor, bold, italic, underline, strikethrough, inverse)
  - `BorderChars` — custom box-drawing character set (8 fields matching cli-boxes BoxStyle)
  - `BorderDef` — border style (preset name or `BorderChars`) + color + backgroundColor
- `src/theme.mts` — `defaultTheme` replicating the original color scheme
- `src/ThemeContext.tsx` — `ThemeProvider` + `useTheme()` hook for context-based theme access
- `App` accepts optional `theme?: Theme` prop; all components consume theme via `useTheme()`


## [0.4.1] - 2026-03-29

### Fixed
- Popup overlays (HistoryPopup, MethodPopup) no longer bleed through underlying UI — added `backgroundColor="black"` to prevent terminal content showing through absolute-positioned boxes

### Added
- `j`/`k` keys for navigation in HistoryPopup and MethodPopup list (in addition to ↑↓)


## [0.4.0] - 2026-03-29

### Changed
- Method section removed from main layout; current method shown in info bar
- `p` now activates inline params editor; `P` opens nvim (was `p`)
- Removed modal insert/command mode for method — replaced by `m` popup

### Added
- `m` — method popup (absolute overlay): text search field + filtered list, Tab switches focus
- Inline multi-line YAML params editor (`ParamsEditor` component)
  - ↑↓←→ navigation, backspace, Enter (newline), Tab (2-space indent), Ctrl+D (delete forward)
  - Esc returns to command mode
- `src/utils/cursor.mts` — pure cursor movement and text editing helpers
- `src/components/ParamsEditor.tsx` — inline editor with cursor rendering
- `src/components/MethodPopup.tsx` — method selection popup


## [0.3.0] - 2026-03-29

### Changed
- Status bar without border
- Removed Tab-based panel focus cycling
- Method input uses modal editing (vim-style): command mode / insert mode
- `p`, `r`, `R`, `Enter` are global shortcuts in command mode
- Removed `focused` props from RequestPanel and ResponsePanel

### Added
- `r` — open nvim (readonly) with response result as YAML
- `R` — open nvim (readonly) with full raw JSON response
- `i` or any letter key — enter method insert mode
- `Esc` — return to command mode from insert mode
- `spawnNvim` helper consolidating all nvim invocations


## [0.2.0] - 2026-03-29

### Changed
- Full-screen single-column layout (method → params → response)
- URL is now a CLI argument (`rpcon <url>`), shown read-only in top bar
- Params entered as YAML, converted to JSON before sending
- Response `result` displayed as YAML; errors shown as plain text
- History panel replaced by popup overlay (`Ctrl+H` to toggle)
- Method field has dropdown autocomplete from history

### Added
- Embedded nvim editing for params (`e` or Enter when params focused)
- `src/utils/yaml.mts` — YAML↔JSON conversion utilities
- `src/components/Autocomplete.tsx` — reusable dropdown autocomplete
- `src/components/HistoryPopup.tsx` — absolute-positioned history overlay

### Removed
- `src/components/HistoryPanel.tsx` — replaced by HistoryPopup
- `RpcClient.parseParams` and `RpcClient.formatResult` — moved to yaml utils

## [0.1.0] - 2026-03-29

### Added
- Initial project setup (Node 24, TypeScript 6, tsx runner)
- JSON-RPC 2.0 client (`RpcClient`) with request/response lifecycle
- HTTP/HTTPS transport (`HttpTransport`) using native `fetch`
- TUI layout with three panels: History, Request, Response
- `ink-text-input` for URL, method, params fields
- Keyboard navigation: Tab (switch panels), ↑↓ (navigate/fields), Enter (send/select)
- Status bar with context-sensitive keyboard hints
- Request history with delete (D key) and re-load (Enter)
