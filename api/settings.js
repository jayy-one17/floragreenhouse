const { readDb, writeDb, sendJson, defaultDb, requireOwner, cleanText } = require("./_db");

module.exports = async function handler(req, res) {
  if (req.method !== "PUT") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }
  if (!requireOwner(req, res)) return;

  try {
    const incoming = (req.body || {}).settings || {};
    const settings = {
      accountName: cleanText(incoming.accountName, 100) || defaultDb.settings.accountName,
      bankName: cleanText(incoming.bankName, 100) || defaultDb.settings.bankName,
      accountNumber: cleanText(incoming.accountNumber, 30),
      whatsappNumber: cleanText(incoming.whatsappNumber, 20).replace(/\D/g, "")
    };

    const db = await readDb();
    db.settings = settings;
    await writeDb(db);
    sendJson(res, 200, { ok: true, settings });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
};
