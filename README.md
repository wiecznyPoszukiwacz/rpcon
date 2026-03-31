# rpcon

A terminal UI client for JSON-RPC 2.0 — built for developers who prefer the keyboard over the mouse and the terminal over the browser tab.

---

## Philosophy

Most API clients are built around the idea that you need to see everything at once: tabs, sidebars, dropdowns, form fields, status codes, raw headers. rpcon takes the opposite approach. The interface shows only what matters for the current task: the method you're calling, the parameters you're passing, and the result you got back.

### YAML as the human interface

JSON-RPC speaks JSON. rpcon lets you write YAML instead.

YAML is a strict superset of JSON, but writing it is significantly less painful — no mandatory quotes around keys, no trailing comma errors, no nested brace counting. rpcon converts your YAML to JSON before sending and converts the response back to YAML for display. You get the full fidelity of JSON-RPC without the friction of writing JSON by hand.

```yaml
# instead of {"account": "0x1234abcd", "block": "latest"}
account: "0x1234abcd"
block: latest
```

The result comes back the same way:

```yaml
balance: "1000000000000000000"
decimals: 18
symbol: ETH
```

### nvim as the editor

When parameters get complex, rpcon steps aside and opens your editor. Press `P` and nvim opens with the current params in a temp file. Save and quit — rpcon picks up where you left off. The same applies to viewing responses: `r` opens the result as YAML, `R` opens the raw JSON. Read-only, syntax-highlighted, navigable with your normal editor motions.

The inline editor (`p`) handles quick edits without leaving the TUI.

### No clutter

There are no panels you don't need, no persistent sidebars, no status fields showing things you didn't ask for. History is a popup — present when you need it (`Ctrl+H`), invisible when you don't. The method name lives in the header. The URL is set once, at startup, and stays out of the way.

---

## Usage

```bash
npx tsx src/index.mts <url>
```

```bash
npx tsx src/index.mts http://localhost:8080/rpc
```

The URL can be omitted if `hooks.rpcon.mjs` exports a `baseUrl` (see [Hooks](#hooks)).

## Hooks

Place a file named `hooks.rpcon.mjs` in the directory you launch rpcon from. All exports are optional.

```js
// hooks.rpcon.mjs

// Omit the URL argument — rpcon reads it from here instead.
// Can also be a function: export function baseUrl() { return process.env.RPC_URL; }
export const baseUrl = "http://localhost:8080/rpc";

// Runs before every request. Mutate request or headers freely.
export function beforeRequest(request, headers) {
  headers["Authorization"] = `Bearer ${process.env.TOKEN}`;
  headers["X-Request-Id"] = crypto.randomUUID();
}

// Runs after every response. Read-only — for logging, metrics, etc.
export function afterResponse(response) {
  console.error("[rpc]", response.id, response.error ?? "ok");
}
```

Press `C` inside rpcon to open the hooks file in nvim. After you save and quit, rpcon checks the syntax and hot-reloads the hooks without restarting.

## Keyboard reference

| Key | Action |
|-----|--------|
| `Enter` | Send request |
| `m` | Open method picker (search + history list) |
| `p` | Focus inline params editor |
| `P` | Open params in nvim |
| `r` | View response result as YAML in nvim (readonly) |
| `R` | View raw JSON response in nvim (readonly) |
| `h` | Toggle history popup |
| `C` | Edit hooks file in nvim, then hot-reload |
| `q` | Quit (asks for confirmation) |
| `Ctrl+C` | Quit immediately |

**In the params editor:**

| Key | Action |
|-----|--------|
| `↑↓←→` | Move cursor |
| `Tab` | Insert 2-space indent |
| `Ctrl+D` | Delete character forward |
| `Esc` | Return to command mode |

**In the method popup:**

| Key | Action |
|-----|--------|
| `Tab` | Switch between search field and list |
| `↑↓` | Navigate list |
| `Enter` | Confirm selection |
| `Esc` | Close |

---

## Roadmap

**Transports**
- WebSocket — persistent connection, streaming notifications
- TCP — raw socket transport for local services
- Unix socket — for services that don't expose HTTP

**Formats**
- gRPC — protobuf-based RPC, schema-aware field completion
- JSON-RPC over WebSocket with subscription support (eth_subscribe etc.)

**History**
- Persistent history across sessions (written to `~/.rpcon/history.json`)
- Search and filter past requests
- Replay a request from history with edited params

**Flows**
- Chain multiple requests where the output of one feeds into the next
- Conditional branching based on response values
- Save and name flows for reuse

**Environment & variables**
- Named environments (local, staging, production) with per-env URLs
- Variable substitution in params: `account: $WALLET_ADDRESS`
- `.env` file support and shell variable passthrough

**Quality of life**
- YAML syntax highlighting in the inline editor
- Schema inference from response history for field completion
- Custom HTTP headers per request or per environment
