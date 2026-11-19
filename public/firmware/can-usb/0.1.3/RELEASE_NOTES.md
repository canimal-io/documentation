## CAN-USB firmware 0.1.3

- CAN FD is now supported on the connector labelled CAN 0, with data rates up to 8 Mbit/s. It needs a USB high-speed connection. The other two connectors stay classic CAN. Hosts that don't turn on CAN FD see no change.
- The host is now told when a channel recovers from error-passive or bus-off. On Linux, `ip -details link show` goes back to ERROR-ACTIVE once the bus is healthy again, instead of staying at ERROR-PASSIVE or BUS-OFF until the interface is restarted.
- Firmware updates over USB are now a trial. The new firmware makes itself permanent only after USB has worked for a short while. If the board is unplugged before that, or the new firmware doesn't start, the previous firmware comes back at the next power-up. Keep the board plugged in for 30 seconds after an update finishes.
- The USB device version now includes the patch version, so you can check that an update took: 0.1.3 shows as 0.13 in `lsusb` and as 0x0013 on macOS. Earlier versions show major and minor only (0.1.2 shows as 0.01).
- To go back to 0.1.2 or older, flash it twice in a row, without unplugging the board in between. The older firmware can't make itself permanent, so a single flash is undone at the next power-up. The second flash, made while the older firmware is running, stays.
- Firmware you build yourself from this release's source confirms itself the same way. Other firmware has to mark itself as confirmed with MCUboot, or it is undone at the next power-up.
