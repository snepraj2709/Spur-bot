const { listMessages, methodNotAllowed, sendJson } = require("../_chatStore");

module.exports = function chatSession(req, res) {
  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET"]);
    return;
  }

  const rawSessionId = req.query.sessionId;
  const sessionId = Array.isArray(rawSessionId)
    ? rawSessionId[0]
    : rawSessionId;

  if (!sessionId) {
    sendJson(res, 400, { error: "sessionId is required." });
    return;
  }

  sendJson(res, 200, {
    sessionId,
    messages: listMessages(sessionId)
  });
};
