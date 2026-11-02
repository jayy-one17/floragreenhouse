const { sendJson, passcodeMatches } = require("./_db");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }
  if (!process.env.OWNER_PASSCODE) {
    return sendJson(res, 503, {
      error: "Owner passcode is not set up on the server yet. Add OWNER_PASSCODE in Vercel settings and redeploy."
    });
  }

  const passcode = (req.body || {}).passcode;
  if (passcodeMatches(passcode)) {
    return sendJson(res, 200, { ok: true });
  }

  // Small delay makes guessing the passcode slow.
  await new Promise((resolve) => setTimeout(resolve, 600));
  sendJson(res, 401, { error: "Incorrect passcode." });
};
