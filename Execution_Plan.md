# Stepwise Execution Plan

## Phase 1: Backend First

### 1. Project Setup

- Create a `backend/` workspace.
- Configure Node.js + TypeScript.
- Add scripts for development, build, lint, database migration, and seed.
- Add environment configuration for:
  - `PORT`
  - `DATABASE_PATH`
  - `REDIS_URL`
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL`
  - `CLIENT_ORIGIN`

### 2. Backend Server

- Create an Express server.
- Add JSON request parsing.
- Add CORS for the frontend origin.
- Add a health route.
- Add a centralized error handler.

### 3. Database Layer

- Create SQLite schema for:
  - `conversations`
  - `messages`
  - `faq_entries`
- Create migration script.
- Create seed script for fictional store FAQ data:
  - Shipping policy
  - Return/refund policy
  - Support hours

### 4. Chat API

- Add `POST /chat/message`.
- Accept `{ message: string, sessionId?: string }`.
- Return `{ reply: string, sessionId: string }`.
- Validate empty messages.
- Handle very long messages sensibly.
- Persist user messages.
- Persist AI messages.
- Associate every message with a session/conversation.

### 5. Conversation History

- Add `GET /chat/session/:sessionId`.
- Return past messages for a conversation.
- Support frontend reload behavior.

### 6. LLM Integration

- Add an OpenAI service.
- Read the API key from environment variables.
- Wrap the LLM call behind `generateReply(history, userMessage)`.
- Include the support-agent system prompt.
- Include recent conversation history.
- Include FAQ/domain knowledge in the prompt.
- Catch LLM/API failures and return a friendly support message.

### 7. Backend Verification

- Run TypeScript build.
- Run database migration.
- Run database seed.
- Check health route.
- Check `POST /chat/message` with valid and invalid input.
- Check `GET /chat/session/:sessionId`.

## Phase 2: Frontend Second

### 1. Project Setup

- Create a `frontend/` workspace.
- Configure React + TypeScript with Vite.
- Add scripts for development, build, lint, and preview.
- Add `VITE_API_BASE_URL` configuration.

### 2. Chat UI

- Build a live chat panel.
- Add a scrollable message list.
- Add clear user and AI message styling.
- Add input box and send button.
- Send on Enter.
- Auto-scroll to the latest message.

### 3. Frontend API Client

- Add a typed chat API client.
- Call `POST /chat/message`.
- Call `GET /chat/session/:sessionId`.
- Store `sessionId` locally.
- Reload past messages when a session exists.

### 4. UI States

- Disable send while request is in flight.
- Show an agent typing state.
- Show clean error messages.
- Keep the UI usable if the backend or LLM fails.

### 5. Frontend Verification

- Run TypeScript build.
- Start the frontend dev server.
- Verify the chat panel renders.
- Verify message submission flow.
- Verify reload with stored `sessionId`.

## Phase 3: Combine Together

### 1. Root Workspace

- Add root `package.json`.
- Configure npm workspaces for:
  - `backend`
  - `frontend`
- Add root scripts:
  - `dev`
  - `dev:backend`
  - `dev:frontend`
  - `build`
  - `lint`
  - `db:migrate`
  - `db:seed`

### 2. Shared Local Configuration

- Add `.env.example`.
- Add `.gitignore`.
- Document backend and frontend ports.
- Document OpenAI API key setup.
- Document database setup.

### 3. Integration Path

- Backend runs on `http://localhost:4000`.
- Frontend runs on `http://localhost:5173`.
- Frontend calls backend through `VITE_API_BASE_URL`.
- Backend allows frontend through `CLIENT_ORIGIN`.

### 4. End-to-End Verification

- Install dependencies.
- Run migrations and seed.
- Start backend and frontend together.
- Send a chat message from the UI.
- Confirm the backend persists the conversation.
- Confirm the AI reply appears in the UI.
- Reload the frontend and confirm history renders.

## Scaffold Deliverables

- Root workspace configuration.
- Backend folder structure.
- Frontend folder structure.
- Database schema and seed files.
- OpenAI service wrapper.
- Chat API route skeleton.
- React chat widget skeleton.
- Local setup documentation.
