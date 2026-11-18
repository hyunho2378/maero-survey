var SCHEMA_VERSION = 1;
var PRIVACY_VERSION = "2026-11-02";
var RETENTION_DAYS = 90;
var SHEET_NAME = "Responses";

var HEADERS = [
  "id",
  "receivedAt",
  "expiresAt",
  "json"
];

var VIDEO_IDS = [
  "ggng8MTKaH0",
  "LnEUYDxIkxk"
];

var ENUMS = {
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

var KEEPSAKES = [
  "keyring",
  "postcard",
  "sticker",
  "tattoo"
];

function doGet() {
  return json_({
    ok: true,
    service: "butterwaffle-survey",
    schemaVersion: SCHEMA_VERSION
  });
}

function doPost(e) {
  try {
    var contents =
      e && e.postData && e.postData.contents
        ? e.postData.contents
        : "";

    if (!contents || contents.length > 65536) {
      fail_("요청 크기와 내용을 확인해 주세요.");
    }

    var request;

    try {
      request = JSON.parse(contents);
    } catch (error) {
      fail_("요청 형식을 확인해 주세요.");
    }

    var configuration = configuration_();

    if (request.action === "submit") {
      return json_(
        saveResponse_(request.payload, configuration)
      );
    }

    if (request.action === "list") {
      if (
        !safeEqual_(
          String(request.adminToken || ""),
          configuration.adminToken
        )
      ) {
        fail_("관리자 권한을 확인해 주세요.");
      }

      return json_({
        ok: true,
        records: listResponses_(configuration)
      });
    }

    fail_("지원하지 않는 요청이에요.");
  } catch (error) {
    return json_({
      ok: false,
      error:
        error && error.publicMessage
          ? error.publicMessage
          : "서버 처리 중 문제가 생겼어요. 운영팀이 실행 기록을 확인해야 해요."
    });
  }
}

function configuration_() {
  var properties = PropertiesService.getScriptProperties();

  var spreadsheetId = String(
    properties.getProperty("SPREADSHEET_ID") || ""
  ).trim();

  var adminToken = String(
    properties.getProperty("ADMIN_TOKEN") || ""
  ).trim();

  var contact = String(
    properties.getProperty("PRIVACY_CONTACT") || ""
  ).trim();

  var newsletterEnabled =
    properties.getProperty("NEWSLETTER_ENABLED") === "true";

  if (
    !spreadsheetId ||
    adminToken.length < 32 ||
    !emailValid_(contact)
  ) {
    fail_("운영 설정을 아직 마치지 않았어요.");
  }

  return {
    spreadsheetId: spreadsheetId,
    adminToken: adminToken,
    contact: contact,
    newsletterEnabled: newsletterEnabled
  };
}

function sheet_(configuration) {
  var spreadsheet = SpreadsheetApp.openById(
    configuration.spreadsheetId
  );

  var sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }

  var actualHeaders = sheet
    .getRange(1, 1, 1, HEADERS.length)
    .getValues()[0];

  if (JSON.stringify(actualHeaders) !== JSON.stringify(HEADERS)) {
    fail_("응답 시트의 열 구성을 확인해 주세요.");
  }

  return sheet;
}

function saveResponse_(payload, configuration) {
  var normalized = validatePayload_(payload, configuration);
  var lock = LockService.getScriptLock();

  if (!lock.tryLock(20000)) {
    fail_("잠시 뒤 같은 응답으로 다시 시도해 주세요.");
  }

  try {
    var sheet = sheet_(configuration);
    var lastRow = sheet.getLastRow();

    if (lastRow > 1) {
      var found = sheet
        .getRange(2, 1, lastRow - 1, 1)
        .createTextFinder(normalized.id)
        .matchEntireCell(true)
        .useRegularExpression(false)
        .findNext();

      if (found) {
        var existing = sheet
          .getRange(found.getRow(), 1, 1, HEADERS.length)
          .getValues()[0];

        return {
          ok: true,
          id: normalized.id,
          receivedAt: String(existing[1]),
          duplicate: true
        };
      }
    }

    var now = new Date();
    var receivedAt = now.toISOString();

    var expiresAt = new Date(
      now.getTime() +
        RETENTION_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();

    var record = Object.assign({}, normalized, {
      receivedAt: receivedAt,
      expiresAt: expiresAt
    });

    var row = sheet.getLastRow() + 1;
    var range = sheet.getRange(row, 1, 1, HEADERS.length);

    range.setNumberFormat("@");

    range.setValues([
      [
        normalized.id,
        receivedAt,
        expiresAt,
        JSON.stringify(record)
      ]
    ]);

    SpreadsheetApp.flush();

    return {
      ok: true,
      id: normalized.id,
      receivedAt: receivedAt,
      duplicate: false
    };
  } finally {
    lock.releaseLock();
  }
}

function listResponses_(configuration) {
  var lock = LockService.getScriptLock();

  if (!lock.tryLock(20000)) {
    fail_("응답을 정리 중이에요. 잠시 뒤 다시 확인해 주세요.");
  }

  try {
    var sheet = sheet_(configuration);
    purgeSheet_(sheet);

    if (sheet.getLastRow() <= 1) return [];

    var values = sheet
      .getRange(2, 4, sheet.getLastRow() - 1, 1)
      .getValues();

    return values.map(function (row) {
      try {
        return JSON.parse(String(row[0]));
      } catch (error) {
        fail_("응답 시트에 읽을 수 없는 기록이 있어요.");
      }
    });
  } finally {
    lock.releaseLock();
  }
}

function validatePayload_(payload, configuration) {
  if (
    !payload ||
    typeof payload !== "object" ||
    payload.schemaVersion !== SCHEMA_VERSION
  ) {
    fail_("응답 버전을 확인해 주세요.");
  }

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      String(payload.id || "")
    )
  ) {
    fail_("응답 번호를 확인해 주세요.");
  }

  var input = payload.answers || {};
  var answers = {};

  Object.keys(ENUMS).forEach(function (key) {
    if (ENUMS[key].indexOf(input[key]) === -1) {
      fail_("필수 문항을 다시 확인해 주세요.");
    }

    answers[key] = input[key];
  });

  ["before", "fit"].forEach(function (key) {
    var value = input[key];

    if (
      typeof value !== "number" ||
      Math.floor(value) !== value ||
      value < 1 ||
      value > 5
    ) {
      fail_("마음 점수를 다시 확인해 주세요.");
    }

    answers[key] = value;
  });

  if (
    !Array.isArray(input.keepsakes) ||
    input.keepsakes.length > KEEPSAKES.length
  ) {
    fail_("물건 문항을 다시 확인해 주세요.");
  }

  var uniqueKeepsakes = {};

  input.keepsakes.forEach(function (item) {
    if (
      KEEPSAKES.indexOf(item) === -1 ||
      uniqueKeepsakes[item]
    ) {
      fail_("물건 문항을 다시 확인해 주세요.");
    }

    uniqueKeepsakes[item] = true;
  });

  answers.keepsakes = input.keepsakes.slice();

  var comment =
    typeof input.comment === "string" ? input.comment.trim() : "";

  if (comment.length > 500) {
    fail_("바라는 점은 500자 안으로 적어 주세요.");
  }

  answers.comment = comment;

  var email = String(input.email || "").trim();

  if (email) {
    if (!configuration.newsletterEnabled) {
      fail_("지금은 이메일을 받을 준비 중이에요.");
    }

    if (!emailValid_(email)) {
      fail_("이메일 주소를 다시 확인해 주세요.");
    }

    if (
      input.emailConsent !== true ||
      !payload.consent ||
      payload.consent.newsletter !== true ||
      payload.consent.version !== PRIVACY_VERSION
    ) {
      fail_("이메일 수집 동의를 확인해 주세요.");
    }
  }

  answers.email = email;
  answers.emailConsent = Boolean(email && input.emailConsent);

  var submittedAt = isoDate_(payload.submittedAt);
  var baseline = payload.baseline;

  if (
    !baseline ||
    !Number.isInteger(baseline.firstValue) ||
    baseline.firstValue < 1 ||
    baseline.firstValue > 5
  ) {
    fail_("처음 마음의 기록을 확인해 주세요.");
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    id: String(payload.id),
    submittedAt: submittedAt,
    answers: answers,

    baseline: {
      firstSelectedAt: isoDate_(baseline.firstSelectedAt),
      firstValue: baseline.firstValue,
      lastChangedAt: isoDate_(baseline.lastChangedAt),
      exposureAtFirstSelection: evidence_(
        baseline.exposureAtFirstSelection
      )
    },

    afterLastChangedAt: isoDate_(payload.afterLastChangedAt),

    scoreDelta: null,

    evidence: evidence_(payload.evidence),

    consent: {
      version: PRIVACY_VERSION,
      newsletter: answers.emailConsent,
      at: answers.emailConsent
        ? isoDate_(payload.consent.at)
        : null
    }
  };
}

function evidence_(input) {
  if (!input || typeof input !== "object") {
    fail_("탐색 기록을 확인해 주세요.");
  }

  var result = {
    startedAt: isoDate_(input.startedAt),
    totalSeconds: nonnegative_(input.totalSeconds),
    viewportWidth: nonnegative_(input.viewportWidth),

    acquisition: {
      utm_source: campaignTag_(
        input.acquisition && input.acquisition.utm_source
      ),
      ref: campaignTag_(
        input.acquisition && input.acquisition.ref
      )
    },

    sectionVisibleSeconds: numericMap_(
      input.sectionVisibleSeconds
    ),

    videos: {},

    photos: {
      viewedIds: idArray_(
        input.photos && input.photos.viewedIds
      ),
      browsedIds: idArray_(
        input.photos && input.photos.browsedIds
      ),
      navigationCount: nonnegative_(
        input.photos && input.photos.navigationCount
      )
    },

    info: {
      openCount: nonnegative_(
        input.info && input.info.openCount
      ),
      byCard: numericMap_(input.info && input.info.byCard)
    }
  };

  VIDEO_IDS.forEach(function (id) {
    var video = input.videos && input.videos[id];

    if (!video) {
      fail_("영상 기록을 확인해 주세요.");
    }

    var errors = Array.isArray(video.errors)
      ? video.errors.slice(0, 20).map(function (value) {
          return String(value).slice(0, 40);
        })
      : [];

    result.videos[id] = {
      loaded: video.loaded === true,
      playedSeconds: nonnegative_(video.playedSeconds),
      wallSeconds: nonnegative_(video.wallSeconds),
      visiblePlayedSeconds: nonnegative_(
        video.visiblePlayedSeconds
      ),
      errors: errors
    };
  });

  return result;
}

function numericMap_(input) {
  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    fail_("탐색 항목을 확인해 주세요.");
  }

  var keys = Object.keys(input);

  if (keys.length > 100) {
    fail_("탐색 항목이 너무 많아요.");
  }

  var result = {};

  keys.forEach(function (key) {
    if (!/^[a-z0-9-]{1,64}$/.test(key)) {
      fail_("탐색 항목 이름을 확인해 주세요.");
    }

    result[key] = nonnegative_(input[key]);
  });

  return result;
}

function idArray_(input) {
  if (!Array.isArray(input) || input.length > 100) {
    fail_("사진 기록을 확인해 주세요.");
  }

  var seen = {};
  var result = [];

  input.forEach(function (value) {
    var id = String(value);

    if (!/^[a-z0-9-]{1,64}$/.test(id)) {
      fail_("사진 기록을 확인해 주세요.");
    }

    if (!seen[id]) {
      result.push(id);
      seen[id] = true;
    }
  });

  return result;
}

function campaignTag_(value) {
  if (!value) return "";

  var text = String(value);

  return /^[a-zA-Z0-9가-힣_.-]{1,64}$/.test(text)
    ? text
    : "redacted";
}

function nonnegative_(value) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    fail_("기록된 숫자를 확인해 주세요.");
  }

  return value;
}

function isoDate_(value) {
  if (typeof value !== "string") {
    fail_("기록 시각을 확인해 주세요.");
  }

  var date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    fail_("기록 시각을 확인해 주세요.");
  }

  return date.toISOString();
}

function emailValid_(value) {
  return (
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

function safeEqual_(input, expected) {
  var mismatch = input.length ^ expected.length;
  var maxLength = Math.max(input.length, expected.length);

  for (var index = 0; index < maxLength; index += 1) {
    mismatch |=
      (input.charCodeAt(index) || 0) ^
      (expected.charCodeAt(index) || 0);
  }

  return mismatch === 0;
}

function purgeSheet_(sheet) {
  var count = sheet.getLastRow() - 1;

  if (count <= 0) return;

  var expiryValues = sheet
    .getRange(2, 3, count, 1)
    .getValues();

  var now = Date.now();

  for (var index = expiryValues.length - 1; index >= 0; index -= 1) {
    var expiry = Date.parse(String(expiryValues[index][0]));

    if (!Number.isFinite(expiry)) {
      fail_("보관 만료 시각이 잘못된 기록이 있어요.");
    }

    if (expiry <= now) {
      sheet.deleteRow(index + 2);
    }
  }
}

function purgeExpiredResponses() {
  var configuration = configuration_();
  var lock = LockService.getScriptLock();

  if (!lock.tryLock(20000)) {
    throw new Error("Could not acquire cleanup lock.");
  }

  try {
    purgeSheet_(sheet_(configuration));
  } finally {
    lock.releaseLock();
  }
}

function setupProject() {
  var configuration = configuration_();
  var lock = LockService.getScriptLock();

  if (!lock.tryLock(20000)) {
    throw new Error("Could not acquire setup lock.");
  }

  try {
    sheet_(configuration);
  } finally {
    lock.releaseLock();
  }

  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (
      trigger.getHandlerFunction() ===
      "purgeExpiredResponses"
    ) {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger("purgeExpiredResponses")
    .timeBased()
    .everyDays(1)
    .create();
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function fail_(message) {
  var error = new Error(message);
  error.publicMessage = message;
  throw error;
}
