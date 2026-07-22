# Y Tree - Connect your accounts

A full-stack take-home application for reviewing investment accounts, adding providers, supplying recent statements, and submitting a complete set. It uses a React/TypeScript frontend and a Spring Boot REST API.

## What the application does

- Loads a seeded list of client accounts and their statement status.
- Filters accounts without changing the readiness calculation for the full list.
- Adds available providers and removes existing accounts.
- Uses a real file picker for realistic interaction, but sends only the selected file name and statement date; no file bytes leave the browser.
- Derives `MISSING`, `UPLOADED`, and `OUTDATED` on the server. `UPLOADED` is presented as **Current** in the UI.
- Explains every status through keyboard- and pointer-accessible tooltips.
- Prevents submission until every account has a current statement and repeats the validation on the server.
- Shows loading, pending, success, empty, and error states.

## Technology

- Backend: Java 17, Spring Boot 3.3.5, Maven, Bean Validation, JUnit 5, and MockMvc.
- Frontend: React 18, TypeScript, Vite, Tailwind CSS 4, and Axios.
- Tests: Vitest, Testing Library, Spring Boot Test, and Playwright.
- Storage: thread-safe in-memory repositories seeded when Spring starts.

## Prerequisites

- Java 17 or newer and Maven 3.9+
- Node.js and pnpm

## Run locally

Start the backend:

```powershell
cd backend
mvn spring-boot:run
```

In another terminal, start the frontend:

```powershell
cd frontend
pnpm install
pnpm dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:8080/api` and permits the Vite development origins `localhost:5173` and `127.0.0.1:5173` through CORS.

To use another API address, set `VITE_API_URL` before starting Vite:

```powershell
$env:VITE_API_URL="http://localhost:8080/api"
pnpm dev
```

## REST API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/accounts` | Return all accounts and overall readiness |
| `GET` | `/api/providers/available` | Return providers that have not been added |
| `POST` | `/api/accounts` | Add a validated list of provider IDs |
| `DELETE` | `/api/accounts/{id}` | Remove an account |
| `PUT` | `/api/accounts/{id}/statement` | Record a statement file name and date |
| `POST` | `/api/submissions` | Submit only when the complete set is ready |

Validation failures use a consistent JSON response containing `code`, `message`, and `details`. An incomplete submission returns HTTP `409 Conflict` and identifies every provider that still needs attention.

## Tests

Run the backend unit, controller, and full-context integration tests:

```powershell
cd backend
mvn test
```

Run the frontend component and Axios-client tests:

```powershell
cd frontend
pnpm test
```

Use `pnpm test:watch` while developing the frontend.

### End-to-end test

Install Chromium once, then run the complete submit flow. Playwright starts both services, so ports `8080` and `5173` must be free.

```powershell
cd frontend
pnpm exec playwright install chromium
pnpm test:e2e
```

Useful interactive modes:

```powershell
pnpm exec playwright test --ui       # watch mode, timeline, and trace viewer
pnpm exec playwright test --headed   # show the browser during the run
pnpm exec playwright test --debug    # step through with Playwright Inspector
```

The backend stores mutations in memory for its process lifetime. After a successful submit-flow test, close Playwright UI and stop its backend before starting a fresh run. Re-running inside the same UI session starts from the already-updated account state. A profile-gated E2E reset fixture is the recommended next improvement.

## Project structure

```text
backend/src/main/java/com/ytree/accountconnect/
  controller/   REST endpoints
  dto/          request and response contracts
  exception/    application errors and global JSON error handling
  mapper/       domain-to-DTO conversion
  model/        immutable domain records and status enum
  repository/   seeded in-memory data access
  service/      business rules and validation

frontend/
  e2e/          Playwright submit-flow test and fixture
  src/api/      Axios client and API error mapping
  src/components/ reusable modals, status badge, and tooltip
  src/App.tsx   page orchestration and interaction state
```

See [NOTES.md](./NOTES.md) for the architecture rationale, edge cases, alternatives, and possible production improvements.
