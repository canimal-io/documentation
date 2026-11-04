## What's Changed
* ENG-140: Accept incoming RTR frames (CONFIG_CAN_ACCEPT_RTR) by @canimal-eng in https://github.com/canimal-io/canimal-core/pull/11
* ENG-20: Version firmware builds explicitly and guard release versions by @canimal-eng in https://github.com/canimal-io/canimal-core/pull/12
* ENG-22: Pin the firmware toolchain (west manifest + hardened build image) by @canimal-eng in https://github.com/canimal-io/canimal-core/pull/10
* ENG-21: Firmware PR CI (build debug/release, size budget, host tests, -Werror for src/) by @canimal-eng in https://github.com/canimal-io/canimal-core/pull/18
* ENG-144: Keep queued TX frames in order (one frame per channel in the FlexCAN) by @canimal-eng in https://github.com/canimal-io/canimal-core/pull/15
* ENG-133: HIL-0 bench suite (3 channels on one bus) and remove the CAN bridge tests by @canimal-eng in https://github.com/canimal-io/canimal-core/pull/13
* ENG-9: Never drop a TX echo; report RX overflow; record session at enqueue by @canimal-eng in https://github.com/canimal-io/canimal-core/pull/16
* ENG-7: Reject short and malformed bulk-OUT host frames instead of using them by @canimal-eng in https://github.com/canimal-io/canimal-core/pull/23
* ENG-156: HIL termination behaviour tests by @canimal-eng in https://github.com/canimal-io/canimal-core/pull/24
* ENG-73: Report the firmware version to the host (gs_usb sw_version, bcdDevice, shell) by @canimal-eng in https://github.com/canimal-io/canimal-core/pull/25
* ENG-157: Termination pin-level readback (debug shell command, HIL test) by @canimal-eng in https://github.com/canimal-io/canimal-core/pull/26
* ENG-160, ENG-161, ENG-162: version and termination follow-ups, boot LED sweep fix by @canimal-eng in https://github.com/canimal-io/canimal-core/pull/27
* ENG-164: Show Canimal Systems CAN-USB as the USB device name by @canimal-eng in https://github.com/canimal-io/canimal-core/pull/28
* ENG-72: Release workflow: tag, signed artifacts, PR to canimal-io/documentation by @canimal-eng in https://github.com/canimal-io/canimal-core/pull/29
* ENG-169: Release workflow: use a GitHub App instead of a fine-grained PAT by @canimal-eng in https://github.com/canimal-io/canimal-core/pull/30


**Full Changelog**: https://github.com/canimal-io/canimal-core/compare/v0.1.1...dry-run-41872356025
