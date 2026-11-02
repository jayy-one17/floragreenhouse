const { readDb, writeDb, sendJson, requireOwner, publicState, cleanText } = require("./_db");

module.exports = async function handler(req, res) {
  try {
    // Owner only: list saved orders.
    if (req.method === "GET") {
      if (!requireOwner(req, res)) return;
      const db = await readDb();
      return sendJson(res, 200, { orders: db.orders || [] });
    }

    if (req.method !== "POST") {
      return sendJson(res, 405, { error: "Method not allowed" });
    }

    // Public: a customer placed an order. Take the stock off the shelf and
    // keep a copy of the order for the owner.
    const body = req.body || {};
    const items = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
    if (!items.length) return sendJson(res, 400, { error: "No items in order" });

    const db = await readDb();
    const ordered = [];

    for (const item of items) {
      const plant = (db.plants || []).find((entry) => entry.id === item.id);
      const qty = Math.floor(Number(item.qty));
      if (!plant || !Number.isFinite(qty) || qty < 1) continue;
      const taken = Math.min(qty, plant.stock);
      if (taken < 1) continue;
      plant.stock -= taken;
      ordered.push({ id: plant.id, name: plant.name, price: plant.price, qty: taken });
    }

    if (!ordered.length) {
      return sendJson(res, 409, { error: "Those plants are no longer in stock", ...publicState(db) });
    }

    const order = {
      id: `order-${Date.now()}`,
      createdAt: new Date().toISOString(),
      items: ordered,
      message: cleanText(body.message, 2000)
    };
    db.orders = [order, ...(db.orders || [])].slice(0, 500);
    await writeDb(db);

    sendJson(res, 201, { ok: true, ...publicState(db) });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
};
