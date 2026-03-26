# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2024-05-23

### Added
- **Doctors Management**: Multi-doctor support with individual profiles, schedules, and service linking.
- **Waiting List**: Automated waitlist management with WhatsApp notifications.
- **Booking Flow**: Public booking wizard with Doctor selection step.
- **Documentation**: Comprehensive README, Setup Guide, API docs, and Feature guides.
- **Testing**: Jest unit tests and Cypress E2E tests infrastructure.
- **CI/CD**: GitHub Actions for linting, testing, and deployment checks.

### Changed
- Updated `generateTimeSlots` to support custom doctor schedules and blocked dates.
- Refactored `BookingPage` to dynamically handle doctor selection.

### Fixed
- Resolved issue where clinic business hours were not correctly parsed for time slot generation.
