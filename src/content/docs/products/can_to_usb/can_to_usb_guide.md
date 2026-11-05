---
title: Canimal CAN-USB User Guide
description: Set up the Canimal CAN-USB on Linux, set bit rates and termination, send and receive frames, and use python-can.
slug: "products/can_to_usb/can_to_usb_guide"
---
## Introduction

The CAN-USB connects a computer to up to three CAN buses over USB-C. On Linux it uses the kernel's SocketCAN `gs_usb` driver, so no extra driver is needed: each channel appears as a network interface (`can0`, `can1`, `can2`).

This guide covers Linux and classic CAN. Steps for macOS and Windows will be added when host software for them is released; until then, contact support. CAN FD setup will be added with the firmware release that enables it.

## Connectors and channels

The three D-Sub connectors are labelled CAN0, CAN1 and CAN2 on the board, from left to right. Each label matches its Linux interface and its termination LED.

| Connector | Linux interface | python-can channel |
| --- | --- | --- |
| CAN0 | `can0` | `"can0"` |
| CAN1 | `can1` | `"can1"` |
| CAN2 | `can2` | `"can2"` |

The interface names assume the CAN-USB is the only CAN adapter on the computer. With other adapters attached, Linux numbers interfaces in the order the devices appear; check with `ip -details link show type can`.

Each connector is a 9-pin D-Sub wired to CiA 106:

| Pin | Signal |
| --- | --- |
| 2 | CAN_L |
| 3 | CAN_GND |
| 7 | CAN_H |

## Linux

### Check the adapter is detected

Plug in the CAN-USB, then list it and its CAN interfaces:

```sh
lsusb -d 1d50:606f
ip -brief link show type can
```

`lsusb` shows one line with ID `1d50:606f`. `ip` lists `can0`, `can1` and `can2`, each `DOWN` until you bring it up.

### Install the CAN utilities

`candump` and `cansend` come with `can-utils`:

```sh
sudo apt install can-utils    # Debian, Ubuntu
sudo dnf install can-utils    # Fedora
```

## Setting bit rates for CAN interfaces

Set the bit rate while the interface is down, then bring it up. For 500 kbit/s on `can0`:

```sh
sudo ip link set can0 down
sudo ip link set can0 type can bitrate 500000 restart-ms 100
sudo ip link set can0 up
```

`restart-ms 100` makes the channel recover by itself 100 ms after a bus-off; leave it out to recover manually. Repeat for `can1` and `can2` with the bit rate of each bus. Every node on a bus must use the same bit rate.

Check the state and error counters:

```sh
ip -details -statistics link show can0
```

A healthy channel on a working bus reports `state ERROR-ACTIVE`.

## Setting termination for individual interfaces

### Linux (SocketCAN / gs_usb)

A high-speed CAN bus normally needs exactly two 120 Ω terminators, one at each physical end of the bus, across CAN_H and CAN_L. Enable the adapter's terminator only when it occupies an end that has no other terminator. Leave it disabled at intermediate nodes or when that end already has an external terminator. The termination LED next to each connector shows its state.

**Prerequisites:** Use a Linux SocketCAN interface bound to `gs_usb`, iproute2 with CAN termination support, and firmware that advertises termination control. Replace `can0` below with the intended channel. Stop applications using that channel before taking it down; this interrupts communication. Do not change termination on an active bus.

Check the driver-reported state and supported values first:

```sh
ip -details link show dev can0
```

Look for `termination 0 [ 0, 120 ]` (disabled) or `termination 120 [ 0, 120 ]` (enabled). The bracketed values are the available settings, in ohms. If this field is absent, the values differ, or a command fails, stop and check the interface, kernel/driver, iproute2 and firmware versions before proceeding; do not assume termination changed.

Choose **one** of these settings. Enable termination:

```sh
sudo ip link set dev can0 down
sudo ip link set dev can0 type can termination 120
ip -details link show dev can0
```

Or disable termination:

```sh
sudo ip link set dev can0 down
sudo ip link set dev can0 type can termination 0
ip -details link show dev can0
```

Confirm the readback is `termination 120 [ 0, 120 ]` or `termination 0 [ 0, 120 ]`, respectively. These commands leave the interface down and do not change its bitrate. After checking wiring, termination and the bus bitrate, resume communication with `sudo ip link set dev can0 up` if the channel is already configured for that bus.

The host argument is a resistance in ohms, not `on`/`off` or the firmware's internal ON/OFF enum. In `gs_usb`, `120` enables termination and `0` disables it; `0` does not request a short circuit.

**Verification scope:** This syntax and readback format are source-verified against [Linux 6.12 SocketCAN documentation](https://www.kernel.org/doc/html/v6.12/networking/can.html#switchable-termination-resistors), the [Linux 6.12 gs_usb driver](https://github.com/torvalds/linux/blob/v6.12/drivers/net/can/usb/gs_usb.c), and [iproute2 6.12.0](https://github.com/iproute2/iproute2/blob/v6.12.0/ip/iplink_can.c). Readback reports software state, not a resistance measurement. The fitted resistance and termination switching on shipping CAN-USB hardware remain unverified; these commands have not been hardware-tested here. This procedure is Linux-only and does not establish Windows or macOS termination support.

## Sending and receiving frames

Watch everything received on `can0`:

```sh
candump can0
```

In another terminal, send frames:

```sh
cansend can0 123#DEADBEEF        # standard ID 0x123, 4 data bytes
cansend can0 12345678#1122334455 # extended ID, 5 data bytes
cansend can0 123#R               # remote (RTR) frame
```

A frame is only sent successfully when another node on the bus acknowledges it. With nothing else on the bus, nothing acknowledges the frame: the channel becomes error-passive and keeps retrying.

### Test with two channels

To check the adapter without other equipment, connect CAN0 and CAN1 to each other (CAN_H to CAN_H, CAN_L to CAN_L, CAN_GND to CAN_GND) and enable termination on both. Bring both up at the same bit rate, then:

```sh
candump can1
```

and in another terminal:

```sh
cansend can0 123#DEADBEEF
```

`candump` prints the frame received on `can1`.

## Using python-can

[python-can](https://python-can.readthedocs.io/) works with the CAN-USB through SocketCAN. Bring the interface up with `ip` first, as above, then:

```sh
pip install python-can
```

```python
import can

with can.Bus(interface="socketcan", channel="can0") as bus:
    bus.send(can.Message(arbitration_id=0x123, data=[0xDE, 0xAD, 0xBE, 0xEF], is_extended_id=False))

    # Print and log received frames until Ctrl+C.
    with open("can0.log", "w") as log:
        for msg in bus:
            line = f"{msg.timestamp:.6f} {msg.arbitration_id:X} {msg.data.hex()}"
            print(line)
            log.write(line + "\n")
```

## Firmware updates

To check the firmware version or update it, see [CAN-USB firmware](/products/can_to_usb/firmware/).
