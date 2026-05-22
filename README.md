# ESP32-S3-ETH-8DI-8RO companion module

[Bitfocus Companion](https://bitfocus.io/companion) module for controlling the **ESP32-S3-ETH-8DI-8RO** relay board via its HTTP REST API.

Requires [ESP32-S3-ETH-8DI-8RO-firmware](https://github.com/andeedotnet/ESP32-S3-ETH-8DI-8RO-firmware) installed.

Supported features: switch 8 relays, read 8 digital inputs, configure input modes, set up webhooks and NTP.

---

## API Endpoints

The module communicates with the following endpoints:

| Method | Path                        | Usage                                  |
|--------|-----------------------------|----------------------------------------|
| GET    | `/api/v1/state`             | Live polling: relay + input states     |
| POST   | `/api/v1/relays/{1-8}`      | Set relay `{"state": 1}`               |
| POST   | `/api/v1/input_modes/{1-8}` | Set input mode                         |
| POST   | `/api/v1/webhooks/{1-8}`    | Configure webhook                      |
| POST   | `/api/v1/ntp`               | Set NTP server and timezone            |

---

## Project Structure

```
.
├── companion/
│   ├── manifest.json   # Module metadata
│   └── HELP.md         # In-app help (shown inside Companion)
├── src/
│   ├── main.js         # Main class: init, polling, HTTP client
│   ├── actions.js      # Actions: Set/Toggle/All Relays, Input Mode, Webhook, NTP
│   ├── feedbacks.js    # Feedbacks: Relay ON/OFF, Input HIGH/LOW
│   ├── variables.js    # Variables: relay_1–8, input_1–8
│   └── upgrades.js     # Migration scripts
├── .dockerignore
├── .yarnrc.yml
├── Dockerfile
└── package.json
```

---

## Build with Docker

### Prerequisites

- Docker installed (version 23+ recommended, BuildKit is the default)
- For older Docker versions: `export DOCKER_BUILDKIT=1`

### Build the module

```bash
mkdir -p build
docker build --output=./build --target=export .
```

The finished package will be in `build/`:

```
build/
└── companion-module-esp32s-relays-0.1.0.tgz
```

### Older Docker versions (fallback without BuildKit output)

```bash
docker build --target=builder -t esp32s-relays-builder .

mkdir -p build
docker run --rm -v "$(pwd)/build:/output" esp32s-relays-builder \
  sh -c 'cp /app/*.tgz /output/'
```

---

## Install the module in Companion

1. Open Companion → **Settings → Add Connection**
2. Click **"Load from file"** in the top right
3. Select the `.tgz` file from `build/`
4. Configure the connection: enter the board's IP address and port

---

## Local Development (without Docker)

Requirements: **Node.js 22**, **Corepack/Yarn 4**

```bash
# Enable Corepack (once)
corepack enable

# Install dependencies
yarn install

# Package the module
yarn package
```

---

## Variables

Once connected, the following variables are available:

| Variable        | Values         | Description          |
|-----------------|----------------|----------------------|
| `$(relay_1)`    | `ON` / `OFF`   | Relay 1 state        |
| …               | …              | …                    |
| `$(relay_8)`    | `ON` / `OFF`   | Relay 8 state        |
| `$(input_1)`    | `HIGH` / `LOW` | Digital input 1      |
| …               | …              | …                    |
| `$(input_8)`    | `HIGH` / `LOW` | Digital input 8      |

---

## Links

- [Companion Module Development](https://companion.free/for-developers/module-development/)
- [ESP32-S3-ETH-8DI-8RO-firmware](https://github.com/andeedotnet/ESP32-S3-ETH-8DI-8RO-firmware)
