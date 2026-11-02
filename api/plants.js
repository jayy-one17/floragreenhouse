const { readDb, writeDb, sendJson, requireOwner, sanitizePlants, deleteImage } = require("./_db");

module.exports = async function handler(req, res) {
  if (req.method !== "PUT") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }
  if (!requireOwner(req, res)) return;

  try {
    const body = req.body || {};
    const plants = await sanitizePlants(body.plants);

    const db = await readDb();
    const keptIds = new Set(plants.map((plant) => plant.id));
    const removed = (db.plants || []).filter((plant) => !keptIds.has(plant.id));

    db.plants = plants;
    await writeDb(db);
    await Promise.all(removed.map((plant) => deleteImage(plant.id)));

    sendJson(res, 200, { ok: true, plants });
  } catch (error) {
    sendJson(res, 400, { error: error.message });
  }
};
