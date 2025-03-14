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

### Windows
1. **Install Drivers:**
   - Download and install the Canimal CAN-USB driver from [Canimal.io](https://canimal.io/product/canimal-can-usb/).
   - Plug in the device via USB-C and verify its detection in Device Manager.
2. **Check Interface:**
   - Open Command Prompt and run:
     ```sh
     mode
     ```
   - The device should appear as a COM port.

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

### Windows:
- Use the provided GUI software or configure via Command Prompt with the following command:
  ```sh
  canimal_can_config.exe --interface can0 --bitrate 500000
  ```

---

## 3. Setting Termination for Individual Interfaces

Some CAN networks require termination. You can enable or disable termination using:
```sh
sudo ip link set can0 down
sudo ip link set can0 up type can bitrate 500000 termination on
```

For Windows, enable termination via GUI settings or use:
```sh
canimal_can_config.exe --interface can0 --termination on
```

---

## 4. Sending CAN Data Over the Interfaces

### Linux/macOS:
Use `cansend`:
```sh
cansend can0 123#DEADBEEF
```

### Windows:
```sh
canimal_can_send.exe --interface can0 --id 123 --data DEADBEEF
```

---

## 5. Receiving Data Over the Interfaces

### Linux/macOS:
Use `candump`:
```sh
candump can0
```

### Windows:
```sh
canimal_can_receive.exe --interface can0
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
