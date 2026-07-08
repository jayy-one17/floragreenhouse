const { readDb, writeDb, sendJson, defaultDb } = require("./_db");

module.exports = async function handler(req, res) {
  if (req.method !== "PUT") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const db = await readDb();
    db.settings = { ...defaultDb.settings, ...(body.settings || {}) };
    await writeDb(db);
    sendJson(res, 200, { ok: true, settings: db.settings });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
};
