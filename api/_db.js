const crypto = require("crypto");
const { Redis } = require("@upstash/redis");

let redisInstance = null;

function getRedis() {
  if (redisInstance) return redisInstance;

  const urlCandidates = [
    process.env.KV_REST_API_URL,
    process.env.KV_REST_API_URL_KV_REST_API_URL,
    process.env.KV_REST_API_URL_KV_URL,
    process.env.KV_URL,
    process.env.UPSTASH_REDIS_REST_URL
  ].filter((v) => typeof v === "string" && v.trim().length > 0);

  const tokenCandidates = [
    process.env.KV_REST_API_TOKEN,
    process.env.KV_REST_API_URL_KV_REST_API_TOKEN,
    process.env.UPSTASH_REDIS_REST_TOKEN
  ].filter((v) => typeof v === "string" && v.trim().length > 0);

  const redisUrl = urlCandidates[0];
  const redisToken = tokenCandidates[0];

  if (!redisUrl || !redisToken) {
    throw new Error(
      "The database is not connected yet. In Vercel, add an Upstash Redis database to this project (Storage tab) and redeploy."
    );
  }

  redisInstance = new Redis({ url: redisUrl, token: redisToken });
  return redisInstance;
}

const DB_KEY = "floragreen:db";
const IMG_PREFIX = "floragreen:img:";

const defaultDb = {
  plants: [
    {
      id: "plant-hibiscus",
      name: "Red Hibiscus Plant",
      price: 14500,
      category: "Flowering",
      stock: 8,
      image: "",
      tone: "#d84b42",
      leaf: "#1e7d53",
      accent: "#f2ba4f",
      description: "A hardy flowering plant that enjoys Abuja sunlight and regular watering."
    },
    {
      id: "plant-peace-lily",
      name: "Peace Lily Plant",
      price: 18000,
      category: "Indoor",
      stock: 6,
      image: "",
      tone: "#ffffff",
      leaf: "#2f7f5d",
      accent: "#d6b35d",
      description: "A graceful indoor plant with white blooms for shaded rooms and offices."
    },
    {
      id: "plant-croton",
      name: "Croton Plant",
      price: 12500,
      category: "Outdoor",
      stock: 10,
      image: "",
      tone: "#e0a236",
      leaf: "#7b9d35",
      accent: "#c94d3d",
      description: "Bright leaf color for verandas, balconies, and warm outdoor corners."
    },
    {
      id: "plant-anthurium",
      name: "Anthurium Plant",
      price: 22000,
      category: "Flowering",
      stock: 5,
      image: "",
      tone: "#b82242",
      leaf: "#24704d",
      accent: "#e6bf53",
      description: "Glossy leaves and long-lasting red flowers for a premium plant gift."
    },
    {
      id: "plant-snake",
      name: "Snake Plant",
      price: 16000,
      category: "Indoor",
      stock: 12,
      image: "",
      tone: "#8eb14a",
      leaf: "#315d43",
      accent: "#b7d96b",
      description: "Low-maintenance upright plant for homes, shops, and workspaces."
    },
    {
      id: "plant-aloe",
      name: "Aloe Vera Plant",
      price: 9500,
      category: "Succulent",
      stock: 9,
      image: "",
      tone: "#78a84d",
      leaf: "#5f9a61",
      accent: "#e1a95b",
      description: "Compact succulent plant suited to bright windows and easy care."
    }
  ],
  settings: {
    accountName: "Floragreen House Ltd",
    bankName: "GTBank",
    accountNumber: "0123456789",
    whatsappNumber: ""
  },
  orders: []
};

// Reads the whole app state from Redis. If nothing has been saved yet,
// seeds Redis with the starter data so the first request isn't empty.
async function readDb() {
  const redis = getRedis();
  const saved = await redis.get(DB_KEY);
  if (saved) {
    // Upstash may return the value already parsed (object) or as a string.
    const parsed = typeof saved === "string" ? JSON.parse(saved) : saved;
    return { ...defaultDb, ...parsed };
  }
  await redis.set(DB_KEY, JSON.stringify(defaultDb));
  return defaultDb;
}

async function writeDb(db) {
  const redis = getRedis();
  await redis.set(DB_KEY, JSON.stringify(db));
}

// What any visitor is allowed to see. Orders (customer names and phone
// numbers) are never included.
function publicState(db) {
  return { plants: db.plants, settings: db.settings };
}

function sendJson(res, status, payload) {
  res.setHeader("Cache-Control", "no-store");
  res.status(status).json(payload);
}

// ---- Owner protection -------------------------------------------------
// The owner passcode lives ONLY in the Vercel environment variable
// OWNER_PASSCODE. It is never in the code or sent to visitors.

function safeEqual(a, b) {
  const hashA = crypto.createHash("sha256").update(String(a)).digest();
  const hashB = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function passcodeMatches(candidate) {
  const expected = process.env.OWNER_PASSCODE;
  if (!expected || typeof candidate !== "string" || !candidate) return false;
  return safeEqual(candidate, expected);
}

// Returns true when the request comes from the owner. Otherwise it sends
// the error response itself and returns false.
function requireOwner(req, res) {
  if (!process.env.OWNER_PASSCODE) {
    sendJson(res, 503, {
      error: "Owner passcode is not set up on the server yet. Add OWNER_PASSCODE in Vercel settings and redeploy."
    });
    return false;
  }
  if (!passcodeMatches(req.headers["x-owner-passcode"])) {
    sendJson(res, 401, { error: "Not authorised. Please log in again." });
    return false;
  }
  return true;
}

// ---- Plant pictures ---------------------------------------------------
// Pictures are stored one per Redis key and served from /api/image, so the
// main shop data stays small and fast.

const IMAGE_URL_PATTERN = /^\/api\/image\?id=[\w-]{1,64}&v=\d+$/;
const DATA_URL_PATTERN = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const MAX_IMAGE_CHARS = 450000;

async function saveImage(plantId, dataUrl) {
  await getRedis().set(IMG_PREFIX + plantId, dataUrl);
  return `/api/image?id=${plantId}&v=${Date.now()}`;
}

async function readImage(plantId) {
  const value = await getRedis().get(IMG_PREFIX + plantId);
  return typeof value === "string" ? value : null;
}

async function deleteImage(plantId) {
  await getRedis().del(IMG_PREFIX + plantId);
}

function cleanText(value, max) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

function cleanColor(value, fallback) {
  return typeof value === "string" && /^#[0-9a-f]{3,8}$/i.test(value) ? value : fallback;
}

// Checks and cleans a plant list sent by the owner. New pictures (data URLs)
// are stored separately and replaced with a short /api/image link.
async function sanitizePlants(list) {
  if (!Array.isArray(list) || list.length > 100) {
    throw new Error("plants must be a list of at most 100 items");
  }
  const seen = new Set();
  const clean = [];

  for (const raw of list) {
    const plant = raw || {};
    const id = cleanText(plant.id, 64);
    if (!/^[\w-]+$/.test(id) || seen.has(id)) throw new Error("A plant has an invalid or repeated id");
    seen.add(id);

    const name = cleanText(plant.name, 100);
    if (!name) throw new Error("Every plant needs a name");
    const price = Number(plant.price);
    const stock = Math.floor(Number(plant.stock));
    if (!Number.isFinite(price) || price < 0 || price > 100000000) throw new Error(`Invalid price for ${name}`);
    if (!Number.isFinite(stock) || stock < 0 || stock > 99999) throw new Error(`Invalid stock for ${name}`);

    let image = "";
    if (typeof plant.image === "string" && plant.image) {
      if (IMAGE_URL_PATTERN.test(plant.image)) {
        image = plant.image;
      } else if (DATA_URL_PATTERN.test(plant.image)) {
        if (plant.image.length > MAX_IMAGE_CHARS) throw new Error(`The picture for ${name} is too large`);
        image = await saveImage(id, plant.image);
      }
    }

    clean.push({
      id,
      name,
      price,
      category: cleanText(plant.category, 40) || "Flowering",
      stock,
      image,
      tone: cleanColor(plant.tone, "#dc6b4f"),
      leaf: cleanColor(plant.leaf, "#28724f"),
      accent: cleanColor(plant.accent, "#f3c45a"),
      description: cleanText(plant.description, 500)
    });
  }
  return clean;
}

module.exports = {
  readDb,
  writeDb,
  publicState,
  sendJson,
  defaultDb,
  passcodeMatches,
  requireOwner,
  sanitizePlants,
  readImage,
  deleteImage,
  cleanText
};
