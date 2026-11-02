const { readImage, sendJson } = require("./_db");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const id = String((req.query || {}).id || "");
    if (!/^[\w-]{1,64}$/.test(id)) return sendJson(res, 400, { error: "Bad image id" });

    const dataUrl = await readImage(id);
    const match = dataUrl && dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
    if (!match) return sendJson(res, 404, { error: "Image not found" });

    res.setHeader("Content-Type", match[1]);
    // The link changes (v=...) whenever the picture changes, so it is safe to cache.
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.status(200).send(Buffer.from(match[2], "base64"));
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
};
