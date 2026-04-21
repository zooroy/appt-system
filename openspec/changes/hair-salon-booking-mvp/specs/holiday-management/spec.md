## ADDED Requirements

### Requirement: Admin can define holiday dates

The system SHALL allow the admin to add and remove specific calendar dates as holidays. A holiday date SHALL cause the availability engine to return zero available slots for that date. Each holiday entry SHALL have a date and an optional reason label.

#### Scenario: Admin adds a holiday

- **WHEN** admin submits a date as a holiday in the admin panel
- **THEN** system stores the holiday and the date becomes unavailable for booking

#### Scenario: Admin removes a holiday

- **WHEN** admin removes a previously set holiday date
- **THEN** system deletes the holiday record and the date becomes available for booking again (subject to existing bookings)

#### Scenario: Admin adds a duplicate holiday date

- **WHEN** admin attempts to add a date that is already marked as a holiday
- **THEN** system SHALL reject the request with a duplicate entry error

### Requirement: System blocks booking on holiday dates

The system SHALL prevent customers from booking on dates marked as holidays. The customer-facing date picker SHALL visually indicate holiday dates as unavailable.

#### Scenario: Customer selects a holiday date

- **WHEN** customer selects a date marked as a holiday in the booking flow
- **THEN** system displays the date as unavailable and returns zero time slots
