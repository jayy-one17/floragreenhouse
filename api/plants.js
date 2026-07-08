const { readDb, writeDb, sendJson } = require("./_db");

module.exports = async function handler(req, res) {
  if (req.method !== "PUT") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    if (!Array.isArray(body.plants)) {
      return sendJson(res, 400, { error: "plants must be an array" });
    }

    const db = await readDb();
    db.plants = body.plants;
    await writeDb(db);
    sendJson(res, 200, { ok: true, plants: db.plants });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
};
