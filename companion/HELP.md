# ESP32-S Relays — 8DI-8RO

This module controls the **ESP32-S3-ETH-8DI-8RO** board via the HTTP REST API of the custom firmware.

## Configuration

| Field             | Description                                        |
|-------------------|----------------------------------------------------|
| Device IP Address | IP address of the board on the network             |
| Port              | HTTP port (default: 80)                            |
| Poll Interval     | Polling interval in ms for relay and input states  |

## Actions

| Action         | Description                                            |
|----------------|--------------------------------------------------------|
| Set Relay      | Turn relay 1–8 on or off                               |
| Toggle Relay   | Toggle relay 1–8                                       |
| Set All Relays | Turn all 8 relays on or off at once                    |
| Set Input Mode | Set input mode + relay mask for input 1–8              |
| Set Webhook    | Configure a webhook for slot 1–8                       |
| Set NTP Config | Configure NTP server and timezone                      |

## Feedbacks

| Feedback              | Description                              |
|-----------------------|------------------------------------------|
| Relay is ON           | Lights green when the relay is on        |
| Relay is OFF          | Lights red when the relay is off         |
| Digital Input is HIGH | Lights blue when the input is HIGH       |
| Digital Input is LOW  | Grey when the input is LOW               |

## Variables

| Variable        | Values          | Description          |
|-----------------|-----------------|----------------------|
| `$(relay_1)`    | `ON` / `OFF`    | Relay 1 state        |
| `$(relay_2–8)`  | `ON` / `OFF`    | Relay 2–8 state      |
| `$(input_1)`    | `HIGH` / `LOW`  | Digital input 1      |
| `$(input_2–8)`  | `HIGH` / `LOW`  | Digital inputs 2–8   |

## Relay Mask (Bitmask)

When setting the input mode, the **Relay Mask** value determines which relays are controlled by that input:

| Value | Binary     | Meaning              |
|-------|------------|----------------------|
| 1     | `00000001` | Relay 1              |
| 3     | `00000011` | Relays 1 + 2         |
| 255   | `11111111` | All 8 relays         |
