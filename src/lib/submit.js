// 원격 주소가 없으면 응답을 메모리 배열에만 보관하므로 새로고침하면 로컬 응답이 사라짐
import { config, isRemote } from "../config.js";

const DAY_MS = 24 * 60 * 60 * 1000;

let localRecords = [];

export function createSubmissionId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = [...bytes]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20)
  ].join("-");
}

function readLocalRecords() {
  const now = Date.now();

  localRecords = localRecords.filter((record) => {
    const expiry = Date.parse(record.expiresAt);

    return (
      record.schemaVersion === config.schemaVersion &&
      typeof record.id === "string" &&
      Number.isFinite(expiry) &&
      expiry > now
    );
  });

  return structuredClone(localRecords);
}

async function request(body) {
  if (
    !/^https:\/\/script\.google\.com\/macros\/s\/[^/?]+\/exec$/.test(
      config.endpoint
    ) &&
    !/^https?:\/\/[^\s/?#]+(\/[^\s?#]*)?\/api\/responses$/.test(
      config.endpoint
    )
  ) {
    throw new Error("서버 전송 주소 설정 확인 필요");
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    30000
  );

  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      redirect: "follow",
      cache: "no-store",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8"
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error("전송 결과 미확인");
    }

    const text = await response.text();
    let result;

    try {
      result = JSON.parse(text);
    } catch {
      throw new Error("서버 응답 형식 미확인");
    }

    if (!result.ok) {
      throw new Error(result.error || "서버 응답 수신 실패");
    }

    return result;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("응답 저장 결과 미확인");
    }

    if (error instanceof TypeError) {
      throw new Error("서버 연결 결과 미확인");
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function submitResponse(payload) {
  if (isRemote) {
    const result = await request({
      action: "submit",
      payload
    });

    if (result.id !== payload.id) {
      throw new Error("응답 번호 불일치");
    }

    return {
      mode: "remote",
      id: result.id,
      receivedAt: result.receivedAt
    };
  }

  const records = readLocalRecords();
  const existing = records.find(
    (record) => record.id === payload.id
  );

  if (existing) {
    return {
      mode: "local",
      id: existing.id,
      receivedAt: existing.receivedAt
    };
  }

  const now = Date.now();

  const record = structuredClone({
    ...payload,
    receivedAt: new Date(now).toISOString(),
    expiresAt: new Date(
      now + config.retentionDays * DAY_MS
    ).toISOString()
  });

  localRecords = [...localRecords, record];

  return {
    mode: "local",
    id: record.id,
    receivedAt: record.receivedAt
  };
}

export async function loadResponses(adminToken = "") {
  if (!isRemote) {
    return readLocalRecords().sort(
      (a, b) =>
        Date.parse(b.receivedAt) - Date.parse(a.receivedAt)
    );
  }

  const result = await request({
    action: "list",
    adminToken
  });

  if (!Array.isArray(result.records)) {
    throw new Error("응답 목록 형식 미확인");
  }

  return result.records.sort(
    (a, b) =>
      Date.parse(b.receivedAt) - Date.parse(a.receivedAt)
  );
}