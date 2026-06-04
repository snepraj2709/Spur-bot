import { strict as assert } from "node:assert";
import test from "node:test";
import { fetchSessionMessages, sendMessage } from "../src/api/chatApi";

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("sendMessage posts the message payload to the chat endpoint", async () => {
  globalThis.fetch = async (url, init) => {
    assert.equal(url, "/chat/message");
    assert.equal(init?.method, "POST");
    assert.equal(init?.headers?.["Content-Type" as keyof HeadersInit], "application/json");
    assert.deepEqual(JSON.parse(String(init?.body)), {
      message: "What is your return policy?",
      sessionId: "session-1"
    });

    return new Response(
      JSON.stringify({ reply: "Return policy answer", sessionId: "session-1" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200
      }
    );
  };

  const response = await sendMessage({
    message: "What is your return policy?",
    sessionId: "session-1"
  });

  assert.deepEqual(response, {
    reply: "Return policy answer",
    sessionId: "session-1"
  });
});

test("fetchSessionMessages reads session history from the session endpoint", async () => {
  globalThis.fetch = async (url) => {
    assert.equal(url, "/chat/session/session-1");

    return new Response(
      JSON.stringify({
        messages: [
          {
            id: "message-1",
            sender: "user",
            text: "Hello",
            timestamp: "2026-06-04T00:00:00.000Z"
          }
        ],
        sessionId: "session-1"
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200
      }
    );
  };

  const response = await fetchSessionMessages("session-1");

  assert.equal(response.sessionId, "session-1");
  assert.equal(response.messages.length, 1);
});

test("API client surfaces backend error messages", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: "message cannot be empty." }), {
      headers: { "Content-Type": "application/json" },
      status: 400
    });

  await assert.rejects(
    () => sendMessage({ message: "" }),
    /message cannot be empty/
  );
});
