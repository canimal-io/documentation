## CAN-USB firmware 0.1.2

- Remote (RTR) frames are now received.
- Frames queued on a channel are sent in the order you submitted them.
- Transmit confirmations are no longer lost under heavy load, and no longer take queue space from received frames.
- Malformed frames from the host are rejected without affecting the bus.
- The firmware version is now reported to the host, in the USB device version (major and minor numbers only) and in the version field the `gs_usb` driver reads.
- The termination LED now always matches the termination state right after power-up.
- The device now appears as "Canimal Systems CAN-USB".
