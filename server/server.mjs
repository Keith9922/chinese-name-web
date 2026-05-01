// Ink Name AI backend — minimal Node http server.
// Runs on a regular VM (no Vercel timeout). Cloudflare Tunnel terminates
// HTTPS in front of it, so we listen on 127.0.0.1 only and let cloudflared
// reach us via localhost.

import http from "node:http";
import { generateName } from "./name-generator.mjs";

const PORT = Number(process.env.PORT) || 3002;
const HOST = process.env.HOST || "127.0.0.1";

// Origins allowed to call us. Vercel preview URLs all match *.vercel.app.
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/ink-name\.vercel\.app$/,
  /^https:\/\/ink-name-[a-z0-9-]+\.vercel\.app$/,
  /^http:\/\/localhost:\d+$/, // local dev
];

function isOriginAllowed(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin));
}

function withCors(res, origin) {
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
}

function sendJson(res, status, body, origin) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  withCors(res, origin);
  res.end(JSON.stringify(body));
}

async function readBody(req, maxBytes = 64 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        req.destroy();
        reject(new Error("Body too large"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve(text ? JSON.parse(text) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

async function handleGenerateName(req, res) {
  const origin = req.headers.origin;
  if (req.method === "OPTIONS") {
    withCors(res, origin);
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" }, origin);
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON" }, origin);
  }

  const { englishName, gender, birthDate, birthTime } = body ?? {};
  if (!englishName || !gender || !birthDate) {
    return sendJson(res, 400, { error: "Missing required fields" }, origin);
  }
  if (!["male", "female", "other"].includes(gender)) {
    return sendJson(res, 400, { error: "Invalid gender" }, origin);
  }

  const t0 = Date.now();
  try {
    const result = await generateName({
      englishName: String(englishName).slice(0, 80),
      gender,
      birthDate: String(birthDate).slice(0, 12),
      birthTime: birthTime ? String(birthTime).slice(0, 8) : undefined,
    });
    const ms = Date.now() - t0;
    console.log(`[generate-name] ${englishName} → ${result.chineseName} (${ms}ms)`);
    sendJson(res, 200, result, origin);
  } catch (err) {
    console.error("[generate-name] error:", err);
    sendJson(res, 500, { error: "Failed to generate name" }, origin);
  }
}

const server = http.createServer(async (req, res) => {
  // Pin a per-request timeout so a stuck MiniMax can't hang the server.
  // We give it 90s — plenty for the model.
  req.setTimeout(90_000);
  res.setTimeout(90_000);

  const origin = req.headers.origin;
  const url = new URL(req.url ?? "/", "http://x");

  if (url.pathname === "/api/generate-name") {
    return handleGenerateName(req, res);
  }
  if (url.pathname === "/api/healthz" || url.pathname === "/healthz") {
    return sendJson(res, 200, { ok: true, ts: Date.now() }, origin);
  }
  if (url.pathname === "/" || url.pathname === "") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Ink Name backend — POST /api/generate-name");
    return;
  }
  sendJson(res, 404, { error: "Not found" }, origin);
});

server.listen(PORT, HOST, () => {
  console.log(`Ink Name backend listening on http://${HOST}:${PORT}`);
});

process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));
