# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build

Build the packaged module inside Docker (output: `build/*.tgz`):

```bash
mkdir -p build
DOCKER_BUILDKIT=1 docker build --output=./build --target=export .
```

Fallback for older Docker without BuildKit output support:

```bash
DOCKER_BUILDKIT=1 docker build --target=builder -t companion-module-builder-tmp . \
  && docker run --rm -v "$(pwd)/build:/output" companion-module-builder-tmp sh -c 'cp /app/*.tgz /output/' \
  && docker rmi companion-module-builder-tmp
```

Or use the `/build-module` skill which handles both paths automatically.

Local build (requires Node.js 22 + Corepack):

```bash
corepack enable
yarn install
yarn package        # → companion-module-esp32s-relays-<version>.tgz
yarn format         # prettier
```

## Architecture

This is a **Bitfocus Companion module** (`@companion-module/base` v2) for the ESP32-S3-ETH-8DI-8RO relay board. Companion loads the module as a Node.js IPC child process; the module communicates with the board over HTTP.

### Data flow

```
Companion ──IPC──► ModuleInstance (src/main.js)
                        │
                        ├─ setInterval → GET /api/v1/state  (poll loop)
                        │       └─ applyState() → setVariableValues() + checkFeedbacks()
                        │
                        └─ Action callbacks → POST /api/v1/relays/{n}  etc.
```

### Module lifecycle (Companion-defined)

`constructor` → `init(config)` → `configUpdated(config)` → `destroy()`

`init` registers actions/feedbacks/variables and starts the poll loop. `configUpdated` restarts the poll loop with the new config. `destroy` clears the timer.

### State

`ModuleInstance` keeps two arrays as the single source of truth:
- `this.relayStates[0..7]` — 0/1 per relay
- `this.inputStates[0..7]` — 0/1 per input

Index `i` = channel `i+1`. Updated exclusively by `applyState()` after each successful poll.

### HTTP client

`apiGet(path)` and `apiPost(path, body)` on `ModuleInstance` (in `src/main.js`) use Node.js 22 built-in `fetch` with a 5 s `AbortSignal.timeout`. All action callbacks call these methods and log errors via `self.log('error', …)` without rethrowing.

### `/api/v1/state` response format

`applyState()` handles both formats from the firmware:
- Array: `{ relays: [0,1,...], inputs: [1,0,...] }` → `relays[i]`
- 1-indexed object: `{ relays: {"1":0,"2":1,...}, inputs: {...} }` → `relays[i+1]`

### Key files

| File | Purpose |
|------|---------|
| `src/main.js` | `ModuleInstance` class — lifecycle, HTTP client, poll loop, state |
| `src/actions.js` | `setActionDefinitions` — 6 actions exported as `module.exports = function(self)` |
| `src/feedbacks.js` | `setFeedbackDefinitions` — 4 boolean feedbacks |
| `src/variables.js` | `setVariableDefinitions` + initial values — `relay_1–8`, `input_1–8` |
| `src/upgrades.js` | Migration scripts array (append-only, never remove entries) |
| `companion/manifest.json` | Module ID, name, runtime entrypoint — must stay in sync with `package.json` `name` and `version` |

### Naming constraints

The module ID in `companion/manifest.json` (`"id"`) must exactly match `package.json` `"name"`. Both follow the Companion convention `companion-module-<manufacturer>-<product>`.

### Adding a new action

Add an entry to the object passed to `self.setActionDefinitions()` in `src/actions.js`. Use `self.apiPost(...)` for device calls. Dropdown option values are strings; cast with `Number()` before sending to the API.

### Companion variables

Variables are referenced in Companion as `$(instance_name:relay_1)` etc. Values are strings: relays `'ON'`/`'OFF'`, inputs `'HIGH'`/`'LOW'`.
