const { methodNotAllowed, sendJson } = require("./_chatStore");

module.exports = function health(req, res) {
  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET"]);
    return;
  }

  sendJson(res, 200, { status: "ok" });
};
