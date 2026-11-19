---
title: Canimal CAN-USB User Guide
description: Set up the Canimal CAN-USB on Linux, set bit rates and termination, send and receive frames, and use python-can.
slug: "products/can_to_usb/can_to_usb_guide"
---
## Introduction

The CAN-USB connects a computer to up to three CAN buses over USB-C. On Linux it uses the kernel's SocketCAN `gs_usb` driver, so no extra driver is needed: each channel appears as a network interface (`can0`, `can1`, `can2`).

This guide covers Linux and classic CAN. Steps for macOS and Windows will be added when host software for them is released; until then, [contact us](https://canimal.io). For CAN FD, see [CAN FD](#can-fd-can-0-only-firmware-013-and-later).

## Connectors and channels

The three D-Sub connectors are labelled CAN 0, CAN 1 and CAN 2 on the board. Each label matches its Linux interface.

| Connector | Linux interface | python-can channel |
| --- | --- | --- |
| CAN 0 | `can0` | `"can0"` |
| CAN 1 | `can1` | `"can1"` |
| CAN 2 | `can2` | `"can2"` |

The interface names assume the CAN-USB is the only CAN adapter on the computer. With other adapters attached, Linux numbers interfaces in the order the devices appear; see which adapter each interface belongs to with `ls -l /sys/class/net/can*/device`.

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

`lsusb` shows one line with ID `1d50:606f`, named "Geschwister Schneider CAN adapter" (the generic `gs_usb` name). `ip` lists `can0`, `can1` and `can2`, each `DOWN` until you bring it up.

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
sudo ip link set can0 type can bitrate 500000
sudo ip link set can0 up
```

The adapter recovers from bus-off by itself; don't set `restart-ms`, which current kernels reject for this driver. Repeat for `can1` and `can2` with the bit rate of each bus. Every node on a bus must use the same bit rate.

Check the state and error counters:

```sh
ip -details -statistics link show can0
```

A healthy channel on a working bus reports `state ERROR-ACTIVE`.

## Setting termination for individual interfaces

### Linux (SocketCAN / gs_usb)

A high-speed CAN bus normally needs exactly two 120 Ω terminators, one at each physical end of the bus, across CAN_H and CAN_L. Enable the adapter's terminator only when it occupies an end that has no other terminator. Leave it disabled at intermediate nodes or when that end already has an external terminator.

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

**Verification scope:** This syntax and readback format are source-verified against [Linux 6.12 SocketCAN documentation](https://www.kernel.org/doc/html/v6.12/networking/can.html#switchable-termination-resistors), the [Linux 6.12 gs_usb driver](https://github.com/torvalds/linux/blob/v6.12/drivers/net/can/usb/gs_usb.c), and [iproute2 6.12.0](https://github.com/iproute2/iproute2/blob/v6.12.0/ip/iplink_can.c). Readback reports software state, not a resistance measurement. The commands were run on a CAN-USB on Debian 13 (kernel 6.18, iproute2 6.15): all three channels read back `0` and `120` as shown, the bitrate was unchanged, and any other value (for example `60`) is rejected. The fitted resistance was not measured. This procedure is Linux-only and does not establish Windows or macOS termination support.

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

Receiving remote frames needs firmware 0.1.2 or later; see [CAN-USB firmware](/products/can_to_usb/firmware/) to check or update.

A frame is only sent successfully when another node on the bus acknowledges it. With nothing else on the bus, nothing acknowledges the frame: the channel becomes error-passive and keeps retrying.

### Test with two channels

To check the adapter without other equipment, connect CAN 0 and CAN 1 to each other (CAN_H to CAN_H, CAN_L to CAN_L, CAN_GND to CAN_GND) and enable termination on both. Bring both up at the same bit rate, then:

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
python3 -m venv ~/can-venv
. ~/can-venv/bin/activate
pip install python-can
```

On Debian and Ubuntu you can instead install the packaged version with `sudo apt install python3-can`.

```python
import can

with can.Bus(interface="socketcan", channel="can0") as bus:
    bus.send(can.Message(arbitration_id=0x123, data=[0xDE, 0xAD, 0xBE, 0xEF], is_extended_id=False))

    # Print and log received frames until Ctrl+C.
    with open("can0.log", "w") as log:
        try:
            for msg in bus:
                line = f"{msg.timestamp:.6f} {msg.arbitration_id:X} {msg.data.hex()}"
                print(line)
                log.write(line + "\n")
        except KeyboardInterrupt:
            pass
```

## CAN FD (CAN 0 only, firmware 0.1.3 and later)

CAN FD works on CAN 0 (`can0`) only. CAN 1 and CAN 2 are classic CAN. The data phase can run up to 8 Mbit/s (tested at 1, 2, 5 and 8 Mbit/s on a short bus with two nodes). Every node on the bus must use the same data bit rate. The 8 Mbit/s data rate needs the CAN-USB connected to a USB high-speed (USB 2.0, 480 Mbit/s) port.

Set the arbitration bit rate and the data bit rate with `fd on`, for example 500 kbit/s and 2 Mbit/s:

```sh
sudo ip link set can0 down
sudo ip link set can0 type can bitrate 500000 dbitrate 2000000 fd on
sudo ip link set can0 up
ip -details link show can0
```

The readback lists `<FD>` and a `dbitrate` line:

```text
can <FD> state ERROR-ACTIVE (berr-counter tx 0 rx 0) restart-ms 0
  bitrate 500000 sample-point 0.875
  ...
  dbitrate 2000000 dsample-point 0.750
```

The interface MTU changes from 16 to 72 so it can carry FD frames.

Send an FD frame with `##`. The digit after it is the flags; `1` turns on the bit-rate switch (BRS), so the data phase runs at the data bit rate. A frame carries up to 64 bytes:

```sh
cansend can0 123##1DEADBEEF
```

Receive with `candump can0`. Add `-x` to see the BRS and ESI flags of received frames.

On CAN 1 and CAN 2, `fd on` is refused:

```text
$ sudo ip link set can1 type can bitrate 500000 dbitrate 2000000 fd on
Error: requested control mode fd not supported.
```

With python-can, open the bus with `fd=True` and send FD messages:

```python
import can

with can.Bus(channel="can0", interface="socketcan", fd=True) as bus:
    bus.send(can.Message(
        arbitration_id=0x123,
        data=bytes(range(64)),
        is_extended_id=False,
        is_fd=True,
        bitrate_switch=True,
    ))
```

## Firmware updates

To check the firmware version or update it, see [CAN-USB firmware](/products/can_to_usb/firmware/).
