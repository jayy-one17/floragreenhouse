const { readDb, writeDb, sendJson } = require("./_db");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const db = await readDb();
    const order = {
      id: `order-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...(body.order || {})
    };
    db.orders = [order, ...(db.orders || [])];
    await writeDb(db);
    sendJson(res, 201, { ok: true, order });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
};
