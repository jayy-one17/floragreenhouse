const { readDb, sendJson } = require("./_db");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const db = await readDb();
    sendJson(res, 200, db);
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
};
