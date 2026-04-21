## ADDED Requirements

### Requirement: System calculates available time slots based on service duration

The system SHALL compute available booking start times for a given date and service. Available slots SHALL be calculated by sliding the service duration window across the business hours, excluding time windows that overlap with existing confirmed bookings, excluding holiday dates, and excluding windows that extend past closing time. Slot interval granularity SHALL be configurable (default: 30 minutes).

#### Scenario: Customer requests slots for a normal business day

- **WHEN** customer selects a service and a non-holiday date within business hours
- **THEN** system returns a list of available start times that do not overlap with existing bookings and fit within business hours

#### Scenario: Customer requests slots for a holiday

- **WHEN** customer selects a date marked as a holiday
- **THEN** system SHALL return an empty list of available slots

#### Scenario: All slots are booked

- **WHEN** customer selects a date where all time windows are occupied by existing confirmed bookings
- **THEN** system SHALL return an empty list of available slots

#### Scenario: Service duration leaves no room at end of day

- **WHEN** a slot start time plus service duration would exceed closing time
- **THEN** system SHALL NOT include that start time in available slots

### Requirement: System prevents double-booking via transactional lock

The system SHALL use a database transaction with pessimistic locking when creating a booking to prevent two concurrent requests from claiming the same time slot. If a conflict is detected during the transaction, the system SHALL reject the second request with a conflict error.

#### Scenario: Two customers attempt to book the same slot simultaneously

- **WHEN** two requests attempt to create a booking for the same start time concurrently
- **THEN** system SHALL confirm one booking and reject the other with a time slot conflict error
