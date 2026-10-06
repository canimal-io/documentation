---
title: Canimal CAN-USB User Guide
description: Documentation for Canimal Systems
slug: "products/can_to_usb/can_to_usb_guide"
---
## Canimal CAN-USB User Guide

## Introduction
The Canimal CAN-USB is designed to connect a USB host to CAN networks. Complete setup, transmit, receive, and update procedures are not yet qualified for a shipping hardware/firmware revision and named host environment. This page retains a limited Linux SocketCAN termination-control reference because its host syntax is source-backed; it is not evidence that termination works on shipping CAN-USB hardware.

---

## 1. Setting Up CAN Interfaces

### Linux

No release-specific Linux setup procedure is currently qualified. Confirm the hardware revision, firmware, Linux distribution/kernel, `gs_usb` driver, interface name, and CAN tooling before use.

### macOS

No macOS setup or driver procedure is currently qualified. Linux SocketCAN commands using `can-utils`, `can0`, or `ip link` are not macOS instructions and must not be used as evidence of macOS support.

### Windows

No Windows setup or driver procedure is currently qualified.

---

## 2. Setting Bit Rates for CAN Interfaces

### Linux/macOS:

No cross-platform bit-rate procedure is currently qualified. Linux SocketCAN configuration does not establish a macOS procedure. Use only a release-specific procedure supplied for the identified host and product configuration.

## 3. Setting Termination for Individual Interfaces

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

**Verification scope:** This syntax and readback format are source-verified against [Linux 6.12 SocketCAN documentation](https://www.kernel.org/doc/html/v6.12/networking/can.html#switchable-termination-resistors), the [Linux 6.12 gs_usb driver](https://github.com/torvalds/linux/blob/v6.12/drivers/net/can/usb/gs_usb.c), and [iproute2 6.12.0](https://github.com/iproute2/iproute2/blob/v6.12.0/ip/iplink_can.c). Readback reports software state, not a resistance measurement. The fitted resistance and termination switching on shipping CAN-USB hardware remain unverified; these commands have not been hardware-tested here. This procedure is Linux-only and does not establish Windows or macOS termination support.

---

## 4. Sending CAN Data Over the Interfaces

### Linux/macOS:

No cross-platform transmit procedure is currently qualified. `cansend` is a Linux SocketCAN tool, not a macOS compatibility claim.

## 5. Receiving Data Over the Interfaces

### Linux/macOS:

No cross-platform receive procedure is currently qualified. `candump` is a Linux SocketCAN tool, not a macOS compatibility claim.
---

## 6. Using Python Jupyter Notebook to Read and Log Data

### Install Dependencies

No release-specific Python package/version set or installation procedure is currently qualified.

### Start Jupyter Notebook

Notebook startup is outside the qualified CAN-USB procedure until the host backend and product configuration are identified and tested.

### Example Python Code for Logging Data

The previous example assumed the Linux `socketcan` backend and an interface named `can0`, while the section was presented without a Linux-only scope. It has been removed pending host testing and a release-specific example with prerequisites, expected results, and error handling.

---
