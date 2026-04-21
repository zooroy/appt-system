## ADDED Requirements

### Requirement: LIFF app embeds the booking flow within LINE

The system SHALL provide a LIFF (LINE Front-end Framework) application that loads the booking web page inside the LINE app. When opened via LIFF, the system SHALL call `liff.init()` and attempt to obtain the user's LINE User ID via `liff.getProfile()`. If the user grants permission, the LINE User ID SHALL be automatically associated with the booking. If the user denies permission or LIFF authorization fails, the system SHALL fall back to manual name and phone number entry.

#### Scenario: Customer opens booking via LINE Rich Menu

- **WHEN** customer taps the booking button in the LINE Rich Menu
- **THEN** LINE opens the LIFF URL and the booking page is displayed inside the LINE app

#### Scenario: Customer grants LINE profile permission in LIFF

- **WHEN** customer authorizes the LIFF app to access their profile
- **THEN** system retrieves the LINE User ID and pre-fills it in the booking payload

#### Scenario: Customer denies LINE profile permission

- **WHEN** customer denies LIFF profile access
- **THEN** system proceeds with manual name and phone input without LINE User ID

### Requirement: System sends LINE push notification on booking confirmation

The system SHALL send a LINE push message to the customer's LINE User ID upon successful booking creation, if the LINE User ID is available. The message SHALL include the service name, date, time, and a booking reference. The system SHALL use the LINE Messaging API to deliver the message. Notification failure SHALL NOT block the booking creation response.

#### Scenario: Booking confirmed with LINE User ID

- **WHEN** a booking is successfully created and a LINE User ID is stored
- **THEN** system sends a push notification to that LINE User ID containing service name, date, and start time

#### Scenario: Booking confirmed without LINE User ID

- **WHEN** a booking is created via the web page without a LINE User ID
- **THEN** system creates the booking successfully without sending a LINE notification

#### Scenario: LINE push notification delivery fails

- **WHEN** the LINE Messaging API returns an error for the push notification
- **THEN** system logs the error and returns the booking confirmation to the customer without surfacing the notification failure

### Requirement: System validates LINE Webhook signatures

The system SHALL validate the X-Line-Signature header on all incoming LINE Webhook requests using the Channel Secret. Requests with invalid or missing signatures SHALL be rejected with HTTP 400.

#### Scenario: Valid webhook received

- **WHEN** LINE sends a webhook event with a valid signature
- **THEN** system processes the event

#### Scenario: Webhook received with invalid signature

- **WHEN** a request arrives at the webhook endpoint with an invalid X-Line-Signature
- **THEN** system SHALL reject the request with HTTP 400 and not process the payload
