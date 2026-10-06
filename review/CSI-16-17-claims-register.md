# CSI-16/17: CAN-USB claims register and containment record

Status: **In Progress**. Founder/Engineering completion required. This record supports claim containment; it is not a datasheet, qualification report, approval, or release decision.

## Scope and classification

Inventory taken 2026-10-06 from the live product, lifecycle, datasheet, and guide pages (all HTTP 200) and current repository `main`: website `b22296795957dac8b398fcb706d96979dd74bbee`, documentation `9f32da98d4677983e9c20528040502b6f772ba76`, and read-only firmware evidence `fedb8edfb8f4d1cc9826851b3e90f925fdf6990e`.

- **Verified:** supported by an applicable reproducible record for the product/revision and stated conditions. No product-level technical claim below reached this class.
- **Design intent / component or interface rating:** present in source/configuration or published as an underlying part/interface characteristic, but not product qualification.
- **Owner-approved commercial term:** requires a recorded commercial/legal owner decision. Existing web copy and a checkout page are not that record.
- **Unverified:** evidence is missing, inapplicable, contradictory, or insufficient for the public scope.

## Claims matrix

| ID | Live claim (grouped where evidence and disposition match) | Location at baseline | Classification / evidence | Containment / completion needed |
| --- | --- | --- | --- | --- |
| C01 | CAN-to-USB product; three CAN channels | Website product/home; datasheet | **Design intent.** Firmware sets `CONFIG_GS_USB_NUM_CHANNELS=3`; board source enables three FlexCAN instances. Source does not identify a qualified release or shipping hardware revision. | Retain as design identity with qualification limit. HIL all channels on identified hardware/firmware. |
| C02 | “High-reliability”, “professional-grade”, “bench and field”, “zero friction”, immediate capture/injection | Website product/home | **Unverified.** No reliability, field, usability, enumeration, or end-to-end test record found. | Remove these product-quality/performance claims. Define measurable acceptance criteria before reuse. |
| C03 | Mac / Windows / Linux; no drivers; any USB-C port; no configuration | Website product; guide introduction | **Unverified.** Firmware uses a `gs_usb` interface; source comments and tests reference Linux. No named Windows/macOS driver, version matrix, or host test record found. | Remove universal claim. Publish only tested host/driver/tool combinations. |
| C04 | Linux device appears as `/dev/ttyUSBX` or `canX`; setup with `lsusb`, `dmesg`, `can-utils`, and `ip link` | Guide | **Unverified for shipping CAN-USB.** Generic Linux commands do not establish device enumeration, interface type/name, or released firmware behavior. | Hold setup procedure pending Linux host testing. |
| C05 | macOS setup via Homebrew `can-utils`, `can0`, `ifconfig`, plus shared Linux/macOS `ip link`, `cansend`, `candump`, and Python `socketcan` | Guide | **Unverified and platform-mismatched.** These are Linux SocketCAN assumptions; no macOS backend/driver evidence found. | Remove as macOS instructions. Host-test and document a real macOS stack before claiming support. |
| C06 | CAN 2.0b; Standard and Extended frames; 8-byte payload | Website/datasheet | **Design intent, product behavior unverified.** Firmware uses Zephyr CAN/`gs_usb` classic-frame structures, but no release build or HIL record establishes end-to-end behavior. | Hold public protocol scope pending identified release build and HIL. |
| C07 | Standard CAN up to 1 Mbit/s | Website/datasheet | **Unverified.** Current board source declares 500 kbit/s defaults and `max-bitrate = <500000>` for all three transceiver nodes; configuration is design metadata, not qualification, and conflicts with the broader public maximum. | Remove 1 Mbit/s claim. Resolve against controlled design records, then HIL each applicable channel/rate. |
| C08 | CAN FD up to 8 Mbit/s and 64-byte payload | Website/datasheet | **Unverified.** `CONFIG_CAN_FD_MODE` is not enabled in `prj.conf`; one board node contains `bitrate-data = <1000000>` while all transceiver nodes declare 500 kbit/s maximum. CSI-7 evidence explicitly says FD container tests are not end-to-end FD qualification and identify CSI-10 dependencies. | Remove public CAN FD/rate/payload claims. Engineering must resolve channel capability and firmware defects, then run HIL. |
| C09 | ISO 11898-2 compliant | Website/datasheet | **Unverified.** No revision-specific conformance report or controlled transceiver/network evidence found. | Remove compliance claim pending applicable conformance evidence. |
| C10 | D-Sub 9-pin, CiA 106 | Website/datasheet | **Unverified.** No controlled schematic, pinout, or mechanical drawing was available in the inspected repositories. | Replace with request-for-pinout limitation; verify controlled records and physical revision. |
| C11 | TI TCAN3413 transceiver | Website | **Unverified product configuration.** The public page names the component; the inspected firmware does not prove the fitted BOM. Any supplier rating would remain a component rating. | Remove until revision-controlled BOM/assembly records identify the fitted part. |
| C12 | Software-selectable termination | Website/datasheet/guide | **Design intent.** Firmware has three termination GPIO paths and `gs_usb` termination controls. Linux 6.12 / iproute2 6.12 syntax is source-backed, but fitted resistance and shipping behavior are explicitly unverified. | Retain only the bounded Linux source reference. HIL readback, switching, resistance, defaults, and all channels. |
| C13 | USB HS 2.0 Type-C; 480 Mbit/s / 60 MB/s; bus powered | Website/datasheet | **Design intent / interface rating, product behavior unverified.** Board source enables `usb1`; firmware descriptors use high-speed endpoint packet sizes. This does not prove connector, negotiated speed, power limits, or application throughput. | Remove product speed/power claim. Verify controlled hardware and USB HIL before publishing scoped values. |
| C14 | 25–30 MB/s write; 30–42 MB/s read | Datasheet | **Unverified.** No procedure, artifact, host, firmware, traffic mix, duration, loss criteria, or result found. | Remove. Requires sustained-load HIL with loss/queue/error reporting. |
| C15 | −40 °C to 125 °C; industrial/extended enclosure options | Website/datasheet | **Unverified.** No product thermal qualification, enclosure definition, controlled BOM, or owner-approved option record found. A component rating would not qualify the assembled product. | Remove. Controlled records plus environmental qualification; commercial owner confirms offered variants. |
| C16 | Ground isolation available on request; standard model non-isolated | Datasheet | **Unverified technical/commercial configuration.** No controlled schematic/BOM or approved option terms found. | Remove. Hardware owner verifies topology/ratings; commercial owner approves option and ordering terms. |
| C17 | Timestamp resolution <42 μs | Datasheet | **Unverified.** Firmware source contains timestamp TODOs and commented/conditional timestamp configuration; no timing procedure or result found. | Remove. Define accuracy vs resolution and qualify across load/channel/host conditions. |
| C18 | Mechanical dimensions 140.00 × 104.50 × 36.50 mm | Datasheet | **Unverified.** Image/public copy is not a controlled drawing or measurement record. | Remove numeric values; provide revision-controlled enclosure drawing and inspection record. |
| C19 | $299 one-time; no licence/subscription fees; “yours forever” | Website product/checkout | **Owner-approved commercial term required.** Live display and checkout destination establish publication, not approval, scope, currency/tax/shipping conditions, or permanence. | Checkout link and displayed price left unchanged by task constraint. Commercial owner must confirm terms; avoid permanence language. |
| C20 | Available through 2035; 12-month EOL notice; lifetime free firmware; no silent revisions; last-time buy | Website product/lifecycle page | **Owner-approved commercial term required.** No recorded owner decision or governing terms were found. | Draft replaces guarantees with items to confirm in writing. Commercial/legal owner supplies approved scope, exceptions, registration, region, revision, and duration before specific promises return. |

## Explicit qualification blockers

### HIL / identified device and release

- Enumeration, reconnect/reset, transmit, receive, error recovery, and update/recovery on a traceable hardware revision and firmware artifact/checksum.
- Each channel in classic CAN and any proposed CAN FD mode/rate; frame formats, payloads, termination state, bus errors, saturation, dropped-frame reporting, sustained load, USB negotiation, and host application throughput.
- Timestamp definition and measurement under stated host, channel, traffic, USB, firmware, and tool conditions.
- Termination readback plus physical resistance/switching/defaults; safe wiring and recovery behavior.

### Controlled hardware / manufacturing records

- Revision-controlled schematic, BOM/AVL, layout, pinout, connector standard, enclosure drawing, assembly/test procedure, serial/lot traceability, and fitted transceiver/termination/isolation configuration.
- Product-level electrical limits, USB power behavior, isolation ratings, thermal/environmental limits, and any compliance/conformance record. Component maxima must remain labeled as component ratings.

### Commercial owner / legal terms

- Price/currency plus tax, shipping, quantity, region, refund/warranty, licence/subscription, and checkout consistency.
- Availability horizon, EOL notice, firmware-update scope/duration, revision notifications, last-time-buy terms, exceptions, registration requirements, and offered isolation/enclosure options.

### Host testing

- Named Windows, Linux, and macOS versions; driver/backend and versions; install/enumeration prerequisites; interface naming; configuration, transmit, receive, termination, error/recovery, and update workflows.
- Linux SocketCAN instructions must remain Linux-only. A macOS procedure requires an actual macOS-compatible driver/backend and tested commands; Linux `ip link`, `can0`, `cansend`, `candump`, and `socketcan` labels are not transferable evidence.

## Draft containment scope

- Website draft removes unsupported compatibility, reliability, performance, thermal, CAN FD/rate, and specific lifecycle guarantees; retains the checkout URL and displayed price unchanged; adds nearby pre-purchase qualification limits.
- Documentation draft removes unsupported numeric specifications and cross-platform setup/transmit/receive examples; retains the source-backed Linux termination syntax with its existing hardware qualification warning.
- No hardware test, controlled-record approval, product qualification, merge, deployment, publication, checkout change, outreach, or Review request occurred. CSI-16/17 remain **In Progress**.

## Sources

- Live snapshots fetched 2026-10-06: [product](https://canimal.io/products), [lifecycle terms baseline](https://canimal.io/availability-promise), [datasheet](https://docs.canimal.io/products/can_to_usb/can_to_usb_specs/), [guide](https://docs.canimal.io/products/can_to_usb/can_to_usb_guide/).
- Website baseline: [`b2229679`](https://github.com/canimal-io/canimal-website/tree/b22296795957dac8b398fcb706d96979dd74bbee), especially `app/products/page.tsx`, `app/page.tsx`, and `app/availability-promise/page.tsx`.
- Documentation baseline: [`9f32da98`](https://github.com/canimal-io/documentation/tree/9f32da98d4677983e9c20528040502b6f772ba76), especially the CAN-USB datasheet and guide.
- Firmware source/configuration (design intent only): [`fedb8edf`](https://github.com/canimal-io/canimal-core/tree/fedb8edfb8f4d1cc9826851b3e90f925fdf6990e), especially `prj.conf`, `boards/arm/canimal/canimal.dts`, `src/gpio.c`, `src/gs_usb/gs_usb.c`, and `test/usb-validation/README.md`.
- Linux termination host syntax cited in the guide: [Linux 6.12 SocketCAN](https://www.kernel.org/doc/html/v6.12/networking/can.html#switchable-termination-resistors), [Linux 6.12 `gs_usb`](https://github.com/torvalds/linux/blob/v6.12/drivers/net/can/usb/gs_usb.c), and [iproute2 6.12.0](https://github.com/iproute2/iproute2/blob/v6.12.0/ip/iplink_can.c).

Ruleset: 7354aaaaa548098a760f517fb34a7241c84e8764; layers: AGENTS.md, README.md, index.md, org/communication.md, org/engineering.md, projects/can-usb.md, repos/canimal-website.md, repos/documentation.md
Checks: live-page inventory PASS; current-main and source/configuration inspection PASS; draft author checks recorded in each PR; not run: HIL, controlled hardware/manufacturing record review, commercial/legal approval, Windows/macOS/Linux host qualification, production/deployment checks
AI-assisted: Canimal Business (OpenClaw / Codex)
