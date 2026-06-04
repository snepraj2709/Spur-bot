# Spur Bot

Mini AI support agent for a live chat widget.

## Project Structure

```text
.
├── backend/          # Node.js + TypeScript API
├── frontend/         # React + TypeScript chat UI
├── Execution_Plan.md # Stepwise execution plan
└── Product_Plan.md   # Structured product brief
```

## Run Locally

1. Install dependencies.

```bash
pnpm install
```

2. Configure backend environment.

```bash
cp backend/.env.example backend/.env
```

Set `OPENAI_API_KEY` in `backend/.env`.

3. Configure frontend environment.

```bash
cp frontend/.env.example frontend/.env
```

4. Set up DB.

```bash
pnpm db:migrate
pnpm db:seed
```

5. Start backend and frontend together.

```bash
pnpm dev
```

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`

## Useful Scripts

```bash
pnpm dev:backend
pnpm dev:frontend
pnpm build
pnpm lint
pnpm test
pnpm db:migrate
pnpm db:seed
```

## Backend Overview

- `src/app.ts` creates the Express app.
- `src/routes/` owns HTTP route wiring.
- `src/controllers/` translates HTTP requests into service calls.
- `src/services/` owns chat workflow and LLM integration.
- `src/repositories/` owns SQLite reads and writes.
- `src/db/` owns schema, migrations, seed data, and the SQLite client.
- `src/cache/` owns the optional Redis connection used to cache FAQ/domain knowledge.
- `src/middleware/` owns centralized error handling.

## Frontend Overview

- `src/App.tsx` mounts the chat experience.
- `src/components/` owns chat UI components.
- `src/api/` owns backend calls.
- `src/types/` owns shared frontend data shapes.
- `src/styles.css` owns responsive chat styling.

## API Contracts

### `POST /chat/message`

Accepts:

```json
{
  "message": "What is your return policy?",
  "sessionId": "optional-session-id"
}
```

Returns:

```json
{
  "reply": "AI support reply",
  "sessionId": "conversation-id"
}
```

### `GET /chat/session/:sessionId`

Returns past messages for a conversation so the frontend can render history on reload.

## LLM Notes

- Provider: OpenAI.
- API key: `OPENAI_API_KEY` in `backend/.env`.
- Model: `OPENAI_MODEL`, defaulting to `gpt-4.1-mini`.
- Redis: set `REDIS_URL` to cache FAQ/domain knowledge; without it, the backend falls back to SQLite.
- Prompting:
  - Uses a support-agent system prompt.
  - Includes recent conversation history.
  - Includes seeded FAQ/domain knowledge.
- Guardrails:
  - Empty messages are rejected.
  - Long messages are truncated using `MAX_MESSAGE_CHARS`.
  - LLM/API failures return a friendly support message instead of crashing the backend.

## Trade-offs and If I Had More Time

- Expand automated tests to cover more browser interaction edge cases.
- Expand Redis-backed caching to response/session data where it provides measurable value.
- Add richer admin tooling for FAQ/domain knowledge.
- Add streaming responses for a more responsive chat experience.
