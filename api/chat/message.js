const {
  ensureConversation,
  generateReply,
  listMessages,
  methodNotAllowed,
  normalizeMessage,
  parseJsonBody,
  saveMessage,
  sendJson
} = require("../_chatStore");

module.exports = async function chatMessage(req, res) {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== "POST") {
    methodNotAllowed(res, ["POST"]);
    return;
  }

  try {
    const body = await parseJsonBody(req);
    const input = normalizeMessage(body);

    if (input.error) {
      sendJson(res, 400, { error: input.error });
      return;
    }

    const sessionId = ensureConversation(input.sessionId);
    const history = listMessages(sessionId).slice(-12);

    saveMessage(sessionId, "user", input.message);

    const reply = await generateReply(history, input.message);

    saveMessage(sessionId, "ai", reply);

    sendJson(res, 200, {
      reply,
      sessionId,
      warning: input.wasTruncated
        ? `Your message was shortened to ${input.maxChars} characters.`
        : undefined
    });
  } catch (_error) {
    sendJson(res, 400, { error: "Invalid chat request." });
  }
};
