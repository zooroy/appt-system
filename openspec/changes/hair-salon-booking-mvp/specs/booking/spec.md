## ADDED Requirements

### Requirement: Customer can create a booking

The system SHALL allow a customer to create a booking by selecting a service, a date, and an available time slot. The customer SHALL provide their name and phone number. If the booking is initiated via LINE LIFF, the system SHALL also store the customer's LINE User ID. Upon successful creation, the booking status SHALL be set to CONFIRMED.

#### Scenario: Customer completes booking via web

- **WHEN** customer selects a service, date, time slot, and submits name and phone number
- **THEN** system creates a booking with status CONFIRMED and returns a booking confirmation with date, time, and service name

#### Scenario: Customer completes booking via LINE LIFF

- **WHEN** customer completes booking flow in LIFF context
- **THEN** system creates a booking and stores the LINE User ID alongside contact details

#### Scenario: Customer attempts to book an unavailable slot

- **WHEN** customer submits a booking for a time slot that is no longer available
- **THEN** system SHALL reject the request with a slot-unavailable error and prompt customer to select a different time

#### Scenario: Customer submits booking without required fields

- **WHEN** customer submits the booking form with missing name or phone number
- **THEN** system SHALL reject the request with a validation error listing the missing fields

### Requirement: Customer can cancel a booking

The system SHALL allow a customer to cancel a booking using the booking ID. Cancellation SHALL only be permitted if the booking start time is at least 2 hours in the future. The booking status SHALL be updated to CANCELLED upon successful cancellation.

#### Scenario: Customer cancels booking with sufficient lead time

- **WHEN** customer requests cancellation and the appointment is more than 2 hours away
- **THEN** system updates booking status to CANCELLED

#### Scenario: Customer attempts to cancel booking too close to appointment time

- **WHEN** customer requests cancellation and the appointment is within 2 hours
- **THEN** system SHALL reject the cancellation with an error indicating the cancellation window has passed

### Requirement: Admin can view and manage all bookings

The system SHALL provide the admin with a list view of all bookings filterable by date and status. Admin SHALL be able to cancel any booking regardless of lead time.

#### Scenario: Admin views bookings for a specific date

- **WHEN** admin selects a date in the admin panel
- **THEN** system displays all bookings for that date with customer name, phone, service, start time, and status

#### Scenario: Admin cancels a booking on behalf of customer

- **WHEN** admin cancels a booking from the admin panel
- **THEN** system updates booking status to CANCELLED
