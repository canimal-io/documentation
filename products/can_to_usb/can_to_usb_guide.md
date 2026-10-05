---
layout: default
title: Canimal CAN-USB User Guide
nav_order: 3
---
# Canimal CAN-USB User Guide

## Introduction
The Canimal CAN-USB adapter enables seamless communication between your computer and CAN networks. This guide provides step-by-step instructions for setting up and using the device on Windows, Linux, and macOS.

---

## 1. Setting Up CAN Interfaces

### Linux
1. **Verify Device Recognition:**
   - Plug in the CAN-USB adapter and check using:
     ```sh
     lsusb
     dmesg | grep can
     ```
   - It should appear as `/dev/ttyUSBX` or `canX`.
2. **Install CAN Utilities (if needed):**
   ```sh
   sudo apt install can-utils
   ```
3. **Bring up the interface:**
   ```sh
   sudo ip link set can0 up type can bitrate 500000
   ```

### macOS
1. **Check Device Detection:**
   - Run:
     ```sh
     ioreg -p IOUSB
     ```
   - The Canimal CAN-USB should be listed.
2. **Install Necessary Tools:**
   ```sh
   brew install can-utils
   ```
3. **Enable Interface:**
   ```sh
   sudo ifconfig can0 up
   ```

---

## 2. Setting Bit Rates for CAN Interfaces

### Linux/macOS:
Set the bitrate to 500kbit/s (example):
```sh
sudo ip link set can0 up type can bitrate 500000
```

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
Use `cansend`:
```sh
cansend can0 123#DEADBEEF
```

## 5. Receiving Data Over the Interfaces

### Linux/macOS:
Use `candump`:
```sh
candump can0
```
---

## 6. Using Python Jupyter Notebook to Read and Log Data

### Install Dependencies
```sh
pip install python-can jupyter
```

### Start Jupyter Notebook
```sh
jupyter notebook
```

### Example Python Code for Logging Data
```python
import can
import time

bus = can.interface.Bus(channel='can0', bustype='socketcan')

# Logging CAN data
with open("log.txt", "w") as log_file:
    for msg in bus:
        log_entry = f"{msg.timestamp}: ID={msg.arbitration_id} DATA={msg.data.hex()}\n"
        print(log_entry)
        log_file.write(log_entry)
```

---
