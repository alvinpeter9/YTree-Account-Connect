# Implementation notes

## Architecture

The backend follows a small layered Spring architecture:

```text
HTTP request
  -> AccountController
  -> AccountService
  -> AccountRepository / ProviderRepository
  -> AccountMapper
  -> response DTO
```

- `controller` owns HTTP routing, response status codes, and request validation entry points.
- `service` owns application rules such as statement validation, provider selection, readiness, and submission.
- `repository` owns storage. The current concrete repositories are deliberately small and in memory.
- `model` contains immutable domain records: `ClientAccount`, `Provider`, and `Statement`, plus `StatementStatus`.
- `dto` defines the public API contract so internal domain objects are not returned directly.
- `mapper` translates domain objects into response DTOs and keeps presentation concerns out of the model.
- `exception` converts expected application and Bean Validation failures into a consistent error contract.

Constructor injection makes dependencies explicit and keeps services testable. Java records are appropriate for these immutable value-oriented models; `ClientAccount.withStatement(...)` returns a new value instead of mutating an existing account. Introducing interfaces for every repository would add indirection without providing a second implementation today. Interfaces become useful when adding database or external-service adapters.

## REST API decisions

The API is REST-style: resources are represented as JSON, HTTP verbs describe operations, endpoints are stateless at the HTTP layer, and meaningful status codes are returned. `POST /api/submissions` models a submission resource/action and returns `201 Created`; invalid state returns `409 Conflict`.

The controller allows only the two local Vite development origins. Postman is not subject to browser CORS enforcement, which is why a request can work in Postman while a browser request is rejected by CORS.

`ApiException` carries an HTTP status, stable machine-readable code, user-facing message, and optional details. `GlobalExceptionHandler` turns it into JSON. Bean Validation failures use the same shape, so the frontend has one error-handling path.

## Statement and submission rules

- Statement status is derived on the server from the statement date. Persisting `OUTDATED` would become incorrect as time passes.
- The three-month rule uses calendar months. A statement dated exactly three months ago is current; an earlier date is outdated.
- `Clock` is injected so date boundaries are deterministic in unit tests.
- The API status is named `UPLOADED`, while the user-facing label is **Current**. The API name describes the presence of an accepted upload record; the UI label communicates whether action is required.
- At least one provider is required before submission.
- Every account must be `UPLOADED` before submission. The service recalculates this from the complete repository state even if a client bypasses the disabled button.
- An incomplete submission returns all invalid providers, for example `HSBC: missing` and `Vanguard: outdated`.
- Future statement dates, missing dates, blank filenames, and filenames longer than 255 characters are rejected.
- Duplicate, null, already-added, and unknown provider IDs are rejected.
- An add-provider request is validated completely before any account is stored, preventing partial writes.

The demo does not upload binary files. The browser file picker provides the expected interaction and supplies a safe file name, but Axios sends only `fileName` and `statementDate` as JSON. A production implementation would upload bytes to object storage through a dedicated multipart or pre-signed-upload flow.

## Frontend decisions

- Axios is configured once with the API base URL, JSON headers, and a ten-second timeout.
- The API wrapper returns typed response data and normalises server, timeout, and unexpected failures into `ApiError`.
- Tailwind utility classes contain the styling. `styles.css` exists only to load Tailwind with `@import "tailwindcss"`.
- One `tsconfig.json` covers application source. Separate Vite application and Node configuration files were unnecessary for this project and were removed.
- Overall readiness always comes from the complete server snapshot. Filtering affects only which rows are visible.
- Mutations wait for the server and expose pending, success, and failure feedback instead of applying optimistic changes that may disagree with server validation.
- The account-list wrapper animates its measured height when a filter changes, avoiding abrupt page jumps. Reduced-motion preferences disable the transition.
- Missing, Current, and Outdated badges include guidance tooltips. The shared tooltip supports hover and keyboard focus, uses `aria-describedby`, and renders through a portal so parent overflow does not clip it.
- Upload and Replace both require a newly selected file. An existing server-side filename is never injected into the browser file input, which browsers intentionally prevent for security.
- Removing an account that already has a statement requires confirmation.

## Test strategy

Backend coverage is split by responsibility:

- `AccountServiceTest` checks the exact three-month boundary, outdated detection, complete validation details, and future-date rejection.
- `SubmissionApiTest` checks the controller-facing conflict response with the service isolated.
- `SubmissionIntegrationTest` loads the Spring context and exercises the real controller, service, seeded repositories, mapper, and global exception handler through MockMvc.

Frontend coverage includes:

- Submission remains disabled for an incomplete snapshot.
- Filtering does not alter overall readiness.
- Status guidance is accessible through the tooltip.
- Replace requires a new file and transmits only its name and date.
- A server-confirmed submission displays the success state.
- Axios request construction and API error mapping are tested separately.

The Playwright test exercises the user-visible submit flow against the real frontend and backend: it verifies the initial disabled state, supplies current HSBC and Vanguard statements, enables submission, submits, and checks the success screen.

Playwright isolates browser contexts, but it cannot automatically roll back this backend's process-wide in-memory repository. UI mode keeps the web servers alive between reruns, so a second run sees the statements created by the first. Restarting the backend restores the seed data. For repeatable watch-mode execution, add an `e2e` Spring profile with a reset endpoint or replace the repository with a per-test disposable database; never expose reset functionality in the normal profile.

## Production alternatives and improvements

- Replace the in-memory maps with a relational database, migrations, unique constraints, repository interfaces, and transactions.
- Add a profile-gated E2E reset fixture so Playwright UI reruns are deterministic.
- Add authentication, authorisation, tenant boundaries, CSRF review, rate limiting, and audit events.
- Upload files to object storage using short-lived signed URLs, then add MIME validation, size limits, malware scanning, encryption, retention, and deletion policies.
- Generate the TypeScript API client and types from an OpenAPI contract.
- Add idempotency keys for submission and other retryable mutations.
- Add structured logs, metrics, tracing, health checks, and correlation IDs.
- Run Maven, Vitest, Playwright, formatting, static analysis, and automated accessibility checks in CI.
- Expand E2E coverage for validation failures, provider management, filtering, keyboard navigation, and responsive layouts.
