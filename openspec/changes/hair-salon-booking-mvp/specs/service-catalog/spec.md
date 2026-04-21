## ADDED Requirements

### Requirement: Admin can manage service items

The system SHALL allow the admin to create, update, and deactivate service items. Each service item SHALL have a name, duration in minutes, and optional description. The system SHALL NOT allow deleting a service item that has existing bookings; instead it SHALL support deactivation.

#### Scenario: Admin creates a new service

- **WHEN** admin submits a valid service name and duration via the admin panel
- **THEN** system creates the service and it appears in the bookable service list

#### Scenario: Admin deactivates a service

- **WHEN** admin deactivates a service item
- **THEN** system marks it as inactive and it SHALL NOT appear in the customer-facing booking flow

#### Scenario: Admin attempts to create service without duration

- **WHEN** admin submits a service form with missing duration
- **THEN** system SHALL reject the request with a validation error

### Requirement: Customer can view available services

The system SHALL display all active service items to customers during the booking flow. Each service entry SHALL show the name, duration, and description if available.

#### Scenario: Customer views service list

- **WHEN** customer opens the booking page
- **THEN** system displays all active services with their names and durations

#### Scenario: No active services exist

- **WHEN** customer opens the booking page and no services are active
- **THEN** system SHALL display a message indicating no services are available
