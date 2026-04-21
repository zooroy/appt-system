## ADDED Requirements

### Requirement: Admin panel is protected by HTTP Basic Auth

The system SHALL protect all admin panel routes with HTTP Basic Auth. Credentials SHALL be configured via environment variables (`ADMIN_USERNAME`, `ADMIN_PASSWORD`). Unauthenticated requests to admin routes SHALL receive HTTP 401.

#### Scenario: Admin accesses panel with correct credentials

- **WHEN** admin provides correct username and password via HTTP Basic Auth
- **THEN** system grants access to the admin panel

#### Scenario: Unauthenticated access to admin route

- **WHEN** a request is made to an admin route without valid credentials
- **THEN** system SHALL respond with HTTP 401

### Requirement: Admin can manage business hours settings

The system SHALL allow the admin to configure the daily business opening time, closing time, and the minimum slot interval (in minutes). Changes SHALL take effect immediately for future availability calculations.

#### Scenario: Admin updates business hours

- **WHEN** admin saves new opening and closing times
- **THEN** system stores the new hours and availability calculations use the updated values for subsequent requests

#### Scenario: Admin sets closing time earlier than opening time

- **WHEN** admin submits a closing time that is equal to or earlier than the opening time
- **THEN** system SHALL reject the update with a validation error

### Requirement: Admin can view bookings dashboard

The system SHALL provide an admin dashboard displaying upcoming bookings grouped by date. The dashboard SHALL show customer name, phone number, service name, start time, end time, and booking status for each entry. Admin SHALL be able to filter by date range and booking status.

#### Scenario: Admin views today's bookings

- **WHEN** admin opens the bookings dashboard with default filter (today)
- **THEN** system displays all bookings for the current date sorted by start time

#### Scenario: Admin filters bookings by status

- **WHEN** admin applies a status filter (e.g., CONFIRMED only)
- **THEN** system displays only bookings matching the selected status
