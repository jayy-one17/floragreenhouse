const { Redis } = require("@upstash/redis");

const redisUrl =
  process.env.KV_REST_API_URL ||
  process.env.KV_URL ||
  process.env.UPSTASH_REDIS_REST_URL;

const redisToken =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  throw new Error(
    "Redis connection env vars are missing. Checked KV_REST_API_URL/KV_URL/UPSTASH_REDIS_REST_URL and KV_REST_API_TOKEN/UPSTASH_REDIS_REST_TOKEN, found url=" +
      JSON.stringify(redisUrl) +
      " token=" +
      (redisToken ? "[present]" : "[missing]")
  );
}

const redis = new Redis({
  url: redisUrl,
  token: redisToken
});

const DB_KEY = "floragreen:db";

const defaultDb = {
  plants: [
    {
      id: "plant-hibiscus",
      name: "Red Hibiscus Plant",
      price: 14500,
      category: "Outdoor",
      stock: 8,
      image: "",
      tone: "#d84b42",
      leaf: "#1e7d53",
      accent: "#f2ba4f",
      description: "A hardy outdoor plant that enjoys Abuja sunlight and regular watering."
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
      category: "Indoor",
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
      category: "Indoor",
      stock: 9,
      image: "",
      tone: "#78a84d",
      leaf: "#5f9a61",
      accent: "#e1a95b",
      description: "Compact indoor plant suited to bright windows and easy care."
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
// seeds Redis with the default starter data so the very first request
// (in any region) doesn't come back empty.
async function readDb() {
  const saved = await redis.get(DB_KEY);
  if (saved) {
    // Upstash may return the value already parsed (object) or as a string
    // depending on how it was stored — handle both safely.
    const parsed = typeof saved === "string" ? JSON.parse(saved) : saved;
    return { ...defaultDb, ...parsed };
  }
  await redis.set(DB_KEY, JSON.stringify(defaultDb));
  return defaultDb;
}

async function writeDb(db) {
  await redis.set(DB_KEY, JSON.stringify(db));
}

function sendJson(res, status, payload) {
  res.status(status).json(payload);
}

module.exports = { redis, readDb, writeDb, sendJson, defaultDb };


