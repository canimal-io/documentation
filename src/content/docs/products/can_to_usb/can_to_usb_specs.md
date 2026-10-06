---
title: Canimal CAN-USB Datasheet
description: Documentation for Canimal Systems
slug: "products/can_to_usb/can_to_usb_specs"
---
## [Canimal CAN-USB Transceiver](https://canimal.io/products)

## Technical Specifications

### Qualification status

Product-level electrical, environmental, compatibility, throughput, timing, and CAN FD limits are being revalidated against revision-controlled hardware records and test results. This page does not currently publish qualified limits. Contact Canimal Systems with the required hardware revision, firmware, host OS/driver/tool versions, channel, bus mode/rate, and operating conditions before purchase or integration.

## CAN Bus

### Channels

- The firmware source configures three CAN channel interfaces. This is design intent, not evidence that a specific shipping hardware/firmware revision passed three-channel operation under load.

### Protocol Support

- Classic CAN and extended-frame behavior require release-specific host and hardware qualification. No CAN FD support claim is made by this page.

### Data Rates

- No qualified product data-rate limit is currently published. Controller, transceiver, firmware configuration, wiring, bus loading, and host behavior all affect the supported rate.

### Payload Capacity

- No qualified payload or CAN FD claim is currently published.

### Compatibility

- ISO 11898-2 compliance has not been established here by a revision-specific conformance record.

### Connection Interface

- Request the revision-specific connector pinout before wiring the product. The previous CiA® 106 claim remains unverified against a controlled drawing.

### Ground Isolation

- Request the revision-specific isolation configuration and ratings. No isolation option or rating is currently qualified by this page.

## USB Connectivity

### Connector Type

- The product design uses a USB-C host connection. USB signaling mode, power limits, and host compatibility require revision-specific confirmation.

### Data Transfer Rates

- No qualified application-throughput or sustained-load rate is currently published. A USB interface signaling rate is not product application throughput.

### Power Supply

- Request revision-specific input and power limits before integration.

### Termination

- Firmware source contains per-channel termination-control paths. Fitted resistance, switching behavior, defaults, and supported release combinations remain unverified on shipping hardware. See the Linux-only source reference in the [user guide](../can_to_usb_guide/).

### Operating Temperature Range

- No qualified product or enclosure operating-temperature range is currently published.

### Timestamp Resolution

- No qualified timestamp accuracy or resolution is currently published.

###  Product Dimensions

- Request the controlled mechanical drawing for the applicable hardware and enclosure revision. The image below is a visual reference, not a qualified dimensional drawing.

![Canimal CAN-USB Transceiver](/assets/img/can-usb/can-usb-dimensions.jpg)
