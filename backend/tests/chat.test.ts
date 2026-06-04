import { strict as assert } from "node:assert";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";
import test from "node:test";

const tempDir = mkdtempSync(join(tmpdir(), "spur-bot-backend-"));

process.env.NODE_ENV = "test";
process.env.DATABASE_PATH = join(tempDir, "test.sqlite");
process.env.REDIS_URL = "";
process.env.OPENAI_API_KEY = "";
process.env.CLIENT_ORIGIN = "http://localhost:5173";
process.env.MAX_MESSAGE_CHARS = "32";
process.env.MAX_HISTORY_MESSAGES = "6";

const { createApp } = await import("../src/app.js");
const { getDb } = await import("../src/db/client.js");
const { seed } = await import("../src/db/seed.js");

seed();

const server = createApp().listen(0);
const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

test.after(() => {
  server.close();
  getDb().close();
  rmSync(tempDir, { force: true, recursive: true });
});

async function postMessage(body: unknown) {
  return fetch(`${baseUrl}/chat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

test("health endpoint responds", async () => {
  const response = await fetch(`${baseUrl}/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("seed creates the required FAQ domain knowledge", () => {
  const rows = getDb()
    .prepare("SELECT id FROM faq_entries ORDER BY id")
    .all() as Array<{ id: string }>;

  assert.deepEqual(
    rows.map((row) => row.id),
    ["return-refund-policy", "shipping-policy", "support-hours"]
  );
});

test("chat endpoint validates empty messages", async () => {
  const response = await postMessage({ message: "   " });
  const payload = (await response.json()) as { error: string };

  assert.equal(response.status, 400);
  assert.equal(payload.error, "message cannot be empty.");
});

test("chat endpoint persists user and AI messages by session", async () => {
  const response = await postMessage({ message: "What is your return policy?" });
  const payload = (await response.json()) as {
    reply: string;
    sessionId: string;
  };

  assert.equal(response.status, 200);
  assert.ok(payload.sessionId);
  assert.match(payload.reply, /trouble connecting to the support agent/i);

  const historyResponse = await fetch(
    `${baseUrl}/chat/session/${payload.sessionId}`
  );
  const history = (await historyResponse.json()) as {
    messages: Array<{ sender: string; text: string }>;
  };

  assert.equal(historyResponse.status, 200);
  assert.equal(history.messages.length, 2);
  assert.equal(history.messages[0]?.sender, "user");
  assert.equal(history.messages[0]?.text, "What is your return policy?");
  assert.equal(history.messages[1]?.sender, "ai");
  assert.equal(history.messages[1]?.text, payload.reply);
});

test("chat endpoint truncates very long messages and returns a warning", async () => {
  const response = await postMessage({ message: "x".repeat(64) });
  const payload = (await response.json()) as {
    sessionId: string;
    warning: string;
  };

  assert.equal(response.status, 200);
  assert.match(payload.warning, /shortened to 32 characters/i);

  const historyResponse = await fetch(
    `${baseUrl}/chat/session/${payload.sessionId}`
  );
  const history = (await historyResponse.json()) as {
    messages: Array<{ sender: string; text: string }>;
  };

  assert.equal(history.messages[0]?.text.length, 32);
});
