// Node http 서버. DATABASE_URL이 있으면 Neon(Postgres)에, 없으면 data/responses.jsonl에 저장한다.
import http from "node:http";
import { appendFile, readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 5970);
const HOST = process.env.HOST || "127.0.0.1";
const ADMIN_TOKEN = String(process.env.ADMIN_TOKEN || "");
const ALLOWED_ORIGINS = String(process.env.ALLOWED_ORIGINS || "")
  .split(",").map((s) => s.trim()).filter(Boolean);
const NEWSLETTER_ENABLED = process.env.NEWSLETTER_ENABLED === "true";
const DATA_FILE = path.resolve(
  process.env.DATA_FILE || path.join(here, "..", "..", "data", "responses.jsonl")
);
const MAX_BODY = 100 * 1024;
const RATE_LIMIT = Number(process.env.RATE_LIMIT || 30);
const SCHEMA_VERSION = 1;
const PRIVACY_VERSION = "2026-11-02";
const RETENTION_DAYS = 90;
const VIDEO_IDS = ["ggng8MTKaH0", "LnEUYDxIkxk"];
const ENUMS = {
  gender: ["female", "male"],
  age: ["teen", "20s", "30s", "40s", "50s", "60s"],
  region: ["chuncheon", "gangwon", "capital", "other"],
  awareness: ["never", "name", "know"],
  souvenir: ["yes", "no"],
  water: ["join", "watch", "maero"],
  fire: ["join", "watch", "maero"],
  maero: ["basic", "blue", "red"],
  price: ["p5900", "p6900", "p7900", "p8900", "p9900"]
};
const KEEPSAKES = ["keyring", "postcard", "sticker", "tattoo"];
const FORBIDDEN_KEYS = /^(name|fullname|full_name|username|phone|tel|telephone|mobile|cellphone|이름|성명|전화|전화번호|휴대폰)$/i;

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const fail = (message, status = 400) => { throw new HttpError(status, message); };

// ---- 검증 ----
const emailValid = (v) => v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
function isoDate(v) {
  if (typeof v !== "string" || v.length > 40) fail("기록 시각을 확인해 주세요.");
  const d = new Date(v);
  if (!Number.isFinite(d.getTime())) fail("기록 시각을 확인해 주세요.");
  return d.toISOString();
}
function nonneg(v) {
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1e9) fail("기록된 숫자를 확인해 주세요.");
  return v;
}
function campaignTag(v) {
  if (!v) return "";
  const t = String(v);
  return /^[a-zA-Z0-9가-힣_.-]{1,64}$/.test(t) ? t : "redacted";
}
function numericMap(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) fail("탐색 항목을 확인해 주세요.");
  const keys = Object.keys(input);
  if (keys.length > 100) fail("탐색 항목이 너무 많아요.");
  const out = {};
  for (const k of keys) {
    if (!/^[a-z0-9-]{1,64}$/.test(k)) fail("탐색 항목 이름을 확인해 주세요.");
    out[k] = nonneg(input[k]);
  }
  return out;
}
function idArray(input) {
  if (!Array.isArray(input) || input.length > 100) fail("사진 기록을 확인해 주세요.");
  const seen = new Set();
  for (const v of input) {
    const id = String(v);
    if (!/^[a-z0-9-]{1,64}$/.test(id)) fail("사진 기록을 확인해 주세요.");
    seen.add(id);
  }
  return [...seen];
}
function evidence(input) {
  if (!input || typeof input !== "object") fail("탐색 기록을 확인해 주세요.");
  const r = {
    startedAt: isoDate(input.startedAt),
    totalSeconds: nonneg(input.totalSeconds),
    viewportWidth: nonneg(input.viewportWidth),
    acquisition: {
      utm_source: campaignTag(input.acquisition?.utm_source),
      ref: campaignTag(input.acquisition?.ref)
    },
    sectionVisibleSeconds: numericMap(input.sectionVisibleSeconds),
    videos: {},
    photos: {
      viewedIds: idArray(input.photos?.viewedIds),
      browsedIds: idArray(input.photos?.browsedIds),
      navigationCount: nonneg(input.photos?.navigationCount)
    },
    info: {
      openCount: nonneg(input.info?.openCount),
      byCard: numericMap(input.info?.byCard)
    }
  };
  for (const id of VIDEO_IDS) {
    const v = input.videos?.[id];
    if (!v) fail("영상 기록을 확인해 주세요.");
    r.videos[id] = {
      loaded: v.loaded === true,
      playedSeconds: nonneg(v.playedSeconds),
      wallSeconds: nonneg(v.wallSeconds),
      visiblePlayedSeconds: nonneg(v.visiblePlayedSeconds),
      errors: Array.isArray(v.errors) ? v.errors.slice(0, 20).map((x) => String(x).slice(0, 40)) : []
    };
  }
  return r;
}
function rejectForbidden(obj, depth = 0) {
  if (!obj || typeof obj !== "object" || depth > 6) return;
  for (const k of Object.keys(obj)) {
    if (FORBIDDEN_KEYS.test(k)) fail("이름과 전화번호는 받지 않아요.");
    rejectForbidden(obj[k], depth + 1);
  }
}
function validatePayload(p) {
  if (!p || typeof p !== "object" || Array.isArray(p) || p.schemaVersion !== SCHEMA_VERSION) fail("응답 버전을 확인해 주세요.");
  rejectForbidden(p);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(p.id || ""))) fail("응답 번호를 확인해 주세요.");
  const input = p.answers && typeof p.answers === "object" ? p.answers : {};
  const answers = {};
  for (const k of Object.keys(ENUMS)) {
    if (!ENUMS[k].includes(input[k])) fail("필수 문항을 다시 확인해 주세요.");
    answers[k] = input[k];
  }
  for (const k of ["before", "fit"]) {
    const v = input[k];
    if (!Number.isInteger(v) || v < 1 || v > 5) fail("마음 점수를 다시 확인해 주세요.");
    answers[k] = v;
  }
  if (!Array.isArray(input.keepsakes) || input.keepsakes.length > KEEPSAKES.length) fail("물건 문항을 다시 확인해 주세요.");
  const uniq = new Set();
  for (const it of input.keepsakes) {
    if (!KEEPSAKES.includes(it) || uniq.has(it)) fail("물건 문항을 다시 확인해 주세요.");
    uniq.add(it);
  }
  answers.keepsakes = [...input.keepsakes];
  const comment = typeof input.comment === "string" ? input.comment.trim() : "";
  if (comment.length > 500) fail("바라는 점은 500자 안으로 적어 주세요.");
  answers.comment = comment;
  const email = String(input.email || "").trim();
  if (email) {
    if (!NEWSLETTER_ENABLED) fail("지금은 이메일을 받을 준비 중이에요.");
    if (!emailValid(email)) fail("이메일 주소를 다시 확인해 주세요.");
    if (input.emailConsent !== true || !p.consent || p.consent.newsletter !== true || p.consent.version !== PRIVACY_VERSION) fail("이메일 수집 동의를 확인해 주세요.");
  }
  answers.email = email;
  answers.emailConsent = Boolean(email && input.emailConsent);
  const b = p.baseline;
  if (!b || !Number.isInteger(b.firstValue) || b.firstValue < 1 || b.firstValue > 5) fail("처음 마음의 기록을 확인해 주세요.");
  return {
    schemaVersion: SCHEMA_VERSION,
    id: String(p.id),
    submittedAt: isoDate(p.submittedAt),
    answers,
    baseline: {
      firstSelectedAt: isoDate(b.firstSelectedAt),
      firstValue: b.firstValue,
      lastChangedAt: isoDate(b.lastChangedAt),
      exposureAtFirstSelection: evidence(b.exposureAtFirstSelection)
    },
    afterLastChangedAt: isoDate(p.afterLastChangedAt),
    scoreDelta: null,
    evidence: evidence(p.evidence),
    consent: {
      version: PRIVACY_VERSION,
      newsletter: answers.emailConsent,
      at: answers.emailConsent ? isoDate(p.consent.at) : null
    }
  };
}

// ---- 저장 ----
const DATABASE_URL = String(process.env.DATABASE_URL || "");
let pool = null;
if (DATABASE_URL) {
  const { default: pg } = await import("pg");
  pool = new pg.Pool({ connectionString: DATABASE_URL, max: 5, idleTimeoutMillis: 30000 });
  await pool.query(`create table if not exists survey_responses (
    id text primary key,
    received_at timestamptz not null default now(),
    expires_at timestamptz not null,
    campaign text,
    record jsonb not null
  )`);
  await pool.query("create index if not exists survey_responses_expires_idx on survey_responses (expires_at)");
  await pool.query("delete from survey_responses where expires_at < now()");
}
async function readAll() {
  if (pool) {
    const r = await pool.query("select record from survey_responses where expires_at > now() order by received_at");
    return r.rows.map((x) => x.record);
  }
  let text = "";
  try { text = await readFile(DATA_FILE, "utf8"); } catch (e) { if (e.code !== "ENOENT") throw e; }
  const now = Date.now();
  const out = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try {
      const r = JSON.parse(line);
      if (Date.parse(r.expiresAt) > now) out.push(r);
    } catch { /* 깨진 줄은 건너뜀 */ }
  }
  return out;
}
let writeQueue = Promise.resolve();
function saveResponse(payload) {
  const job = writeQueue.then(async () => {
    const normalized = validatePayload(payload);
    const existing = pool ? null : (await readAll()).find((r) => r.id === normalized.id);
    if (existing) return { ok: true, id: existing.id, receivedAt: existing.receivedAt, duplicate: true };
    const now = Date.now();
    const record = {
      ...normalized,
      receivedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + RETENTION_DAYS * 86400000).toISOString()
    };
    if (pool) {
      const ins = await pool.query(
        "insert into survey_responses (id, received_at, expires_at, campaign, record) values ($1, $2, $3, $4, $5) on conflict (id) do nothing returning id",
        [record.id, record.receivedAt, record.expiresAt, String(record.campaign || record.utm || ""), record]
      );
      if (ins.rowCount === 0) return { ok: true, id: record.id, duplicate: true };
      return { ok: true, id: record.id, receivedAt: record.receivedAt, duplicate: false };
    }
    await mkdir(path.dirname(DATA_FILE), { recursive: true });
    await appendFile(DATA_FILE, JSON.stringify(record) + "\n", "utf8");
    return { ok: true, id: record.id, receivedAt: record.receivedAt, duplicate: false };
  });
  writeQueue = job.catch(() => {});
  return job;
}

// ---- CSV ----
function csvCell(v) {
  let s = v == null ? "" : Array.isArray(v) ? v.join("|") : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCsv(records) {
  const head = ["id", "receivedAt", "submittedAt", "gender", "age", "region", "awareness", "souvenir", "before", "water", "fire", "maero", "fit", "keepsakes", "price", "comment", "email", "emailConsent", "totalSeconds", "viewportWidth", "utm_source", "ref"];
  const rows = records.map((r) => [
    r.id, r.receivedAt, r.submittedAt, r.answers.gender, r.answers.age, r.answers.region, r.answers.awareness, r.answers.souvenir, r.answers.before,
    r.answers.water, r.answers.fire, r.answers.maero, r.answers.fit, r.answers.keepsakes, r.answers.price, r.answers.comment, r.answers.email, r.answers.emailConsent,
    r.evidence.totalSeconds, r.evidence.viewportWidth, r.evidence.acquisition.utm_source, r.evidence.acquisition.ref
  ]);
  return "\uFEFF" + [head, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

// ---- 속도 제한 ----
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < 60000)) hits.delete(k);
  return arr.length > RATE_LIMIT;
}

// ---- HTTP ----
function tokenOk(input) {
  if (ADMIN_TOKEN.length < 16) return false;
  const a = Buffer.from(String(input || "")), b = Buffer.from(ADMIN_TOKEN);
  return a.length === b.length && timingSafeEqual(a, b);
}
function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "600");
  }
}
function send(res, status, body, type = "application/json; charset=utf-8", extra = {}) {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...extra });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    const len = Number(req.headers["content-length"] || 0);
    if (len > MAX_BODY) return reject(new HttpError(413, "요청 크기가 너무 커요."));
    let size = 0; const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new HttpError(413, "요청 크기가 너무 커요.")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    cors(req, res);
    const url = new URL(req.url, "http://localhost");
    if (req.method === "OPTIONS") {
      const ok = req.headers.origin && ALLOWED_ORIGINS.includes(req.headers.origin);
      res.writeHead(ok ? 204 : 403); return res.end();
    }
    if (url.pathname === "/health") return send(res, 200, { ok: true, storage: pool ? "postgres" : "file" });
    if (url.pathname !== "/api/responses") return send(res, 404, { ok: false, error: "없는 주소예요." });

    const ip = req.socket.remoteAddress || "unknown";
    if (limited(ip)) return send(res, 429, { ok: false, error: "요청이 너무 많아요. 잠시 뒤 다시 시도해 주세요." }, undefined, { "Retry-After": "60" });

    if (req.headers.origin && !ALLOWED_ORIGINS.includes(req.headers.origin)) {
      return send(res, 403, { ok: false, error: "허용되지 않은 출처예요." });
    }

    if (req.method === "GET" && url.searchParams.get("summary") === "1") {
      // 비밀번호 없이 보는 현황: 문항별 응답 수만 보냄. 자유 서술과 기록 원문은 보내지 않음.
      const records = await readAll();
      const keys = ["gender", "age", "region", "awareness", "souvenir", "before", "water", "fire", "maero", "fit", "keepsakes", "price"];
      const counts = {};
      for (const k of keys) counts[k] = {};
      const kst = (iso) => new Date(Date.parse(iso) + 9 * 3600000).toISOString().slice(0, 10);
      const todayKey = kst(new Date().toISOString());
      let today = 0;
      for (const r of records) {
        if (r.receivedAt && kst(r.receivedAt) === todayKey) today += 1;
        const ans = r.answers || {};
        for (const k of keys) {
          const v = ans[k];
          for (const item of Array.isArray(v) ? v : [v]) {
            if (item == null || item === "") continue;
            counts[k][String(item)] = (counts[k][String(item)] || 0) + 1;
          }
        }
      }
      const last = records.reduce((m, r) => (r.receivedAt && r.receivedAt > m ? r.receivedAt : m), "");
      return send(res, 200, { ok: true, total: records.length, today, last, counts });
    }

    if (req.method === "GET") {
      if (!tokenOk(url.searchParams.get("admin"))) return send(res, 401, { ok: false, error: "관리자 권한을 확인해 주세요." });
      const records = await readAll();
      if (url.searchParams.get("format") === "csv") {
        return send(res, 200, toCsv(records), "text/csv; charset=utf-8", { "Content-Disposition": 'attachment; filename="responses.csv"' });
      }
      return send(res, 200, { ok: true, records });
    }

    if (req.method === "POST") {
      const raw = await readBody(req);
      let body;
      try { body = JSON.parse(raw); } catch { fail("요청 형식을 확인해 주세요."); }
      if (!body || typeof body !== "object") fail("요청 형식을 확인해 주세요.");
      // 프론트 어댑터 형식 {action, payload}와 순수 payload 둘 다 받는다.
      if (body.action === "list") {
        if (!tokenOk(body.adminToken)) return send(res, 401, { ok: false, error: "관리자 권한을 확인해 주세요." });
        return send(res, 200, { ok: true, records: await readAll() });
      }
      const payload = body.action === "submit" ? body.payload : body;
      return send(res, 200, await saveResponse(payload));
    }
    return send(res, 405, { ok: false, error: "지원하지 않는 방식이에요." }, undefined, { Allow: "GET,POST,OPTIONS" });
  } catch (e) {
    if (e instanceof HttpError) return send(res, e.status, { ok: false, error: e.message });
    console.error("[server]", e);
    send(res, 500, { ok: false, error: "서버 처리 중 문제가 생겼어요." });
  }
});

if (ADMIN_TOKEN.length < 16) console.warn("[server] ADMIN_TOKEN이 16자 미만이라 목록 조회가 막혀 있어요.");
server.listen(PORT, HOST, () => console.info(`[server] http://${HOST}:${PORT}/api/responses 저장 위치 ${pool ? "Neon Postgres" : DATA_FILE}`));
