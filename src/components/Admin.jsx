import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { isRemote } from "../config.js";
import { answerLabel } from "../data/questions.js";
import { loadResponses } from "../lib/submit.js";
import { downloadCSV } from "../lib/csv.js";

import { ChoiceIndicator } from "./QuestionCard.jsx";

const views = [
  { value: "all", label: "전체" },
  { value: "today", label: "오늘" },
  { value: "channels", label: "채널별" }
];

const dayFormatter = new Intl.DateTimeFormat("en", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

function average(records, key) {
  const values = records
    .map((record) => record.answers?.[key])
    .filter(
      (value) =>
        Number.isInteger(value) && value >= 1 && value <= 5
    );

  if (!values.length) return "집계 대상 없음";

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  ).toFixed(2);
}

function formatDate(value) {
  if (value === undefined || value === null || value === "") {
    return "확인 불가";
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "확인 불가";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul"
  }).format(date);
}

function dayKey(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "";
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) return "";

  const parts = dayFormatter.formatToParts(date);

  function part(type) {
    return parts.find((item) => item.type === type)?.value || "";
  }

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function playback(record, id) {
  const value = record.evidence?.videos?.[id]?.playedSeconds;

  return Number.isFinite(value)
    ? value.toFixed(1)
    : "0.0";
}

function displayAnswer(id, value) {
  if (value === undefined || value === null || value === "") {
    return "확인 불가";
  }

  return answerLabel(id, value);
}

function isChannelValue(value) {
  return (
    (typeof value === "string" && value.trim() !== "") ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

/*
 * API 응답 포맷은 변경하지 않습니다.
 * loadResponses가 돌려준 각 record의 실제 필드만 검사합니다.
 *
 * 이름이 channel, utm_source, source인 스칼라 필드를 후보로
 * 보여 주고 운영자가 선택한 필드만 채널로 사용합니다.
 * campaign을 채널로 간주하거나 유입 값을 새로 만들지 않습니다.
 */
function discoverChannelFields(records) {
  const found = new Map();
  const candidateName = /^(channel|utm_source|source)$/i;

  function inspect(value, path, depth) {
    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value) ||
      depth > 8
    ) {
      return;
    }

    for (const [name, child] of Object.entries(value)) {
      const nextPath = [...path, name];

      if (candidateName.test(name) && isChannelValue(child)) {
        const key = JSON.stringify(nextPath);

        found.set(key, {
          key,
          path: nextPath,
          label: nextPath.join(".")
        });
      }

      if (
        child &&
        typeof child === "object" &&
        !Array.isArray(child)
      ) {
        inspect(child, nextPath, depth + 1);
      }
    }
  }

  for (const record of records) {
    for (const [name, value] of Object.entries(record)) {
      if (candidateName.test(name) && isChannelValue(value)) {
        const path = [name];
        const key = JSON.stringify(path);

        found.set(key, {
          key,
          path,
          label: name
        });
      }
    }

    inspect(record.evidence, ["evidence"], 0);
  }

  return [...found.values()].sort((left, right) =>
    left.label.localeCompare(right.label)
  );
}

function readPath(record, path) {
  let current = record;

  for (const key of path) {
    if (
      !current ||
      typeof current !== "object" ||
      !Object.prototype.hasOwnProperty.call(current, key)
    ) {
      return undefined;
    }

    current = current[key];
  }

  return current;
}

function groupByChannel(records, path) {
  const groups = new Map();

  for (const record of records) {
    const rawValue = readPath(record, path);
    const available = isChannelValue(rawValue);

    const key = available
      ? JSON.stringify([typeof rawValue, rawValue])
      : "missing";

    const label = available
      ? String(rawValue)
      : "채널 값 없음";

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label,
        records: []
      });
    }

    groups.get(key).records.push(record);
  }

  return [...groups.values()];
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="m5 12 4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ResponseList({ records }) {
  return (
    <div className="ios-admin-group">
      {records.map((record) => {
        const answers = record.answers || {};

        const scoreDifference =
          Number.isFinite(answers.after) &&
          Number.isFinite(answers.before)
            ? answers.after - answers.before
            : "확인 불가";

        /*
         * 영상 식별자는 전달받은 Admin 원문 값을 유지합니다.
         * CSV에 전달하는 record도 수정하지 않습니다.
         */
        const rows = [
          [
            "인지도",
            displayAnswer("awareness", answers.awareness)
          ],
          [
            "처음",
            answers.before ?? "확인 불가"
          ],
          [
            "지금",
            answers.after ?? "확인 불가"
          ],
          ["변화", scoreDifference],
          [
            "물의 반응",
            displayAnswer("water", answers.water)
          ],
          [
            "밤의 반응",
            displayAnswer("fire", answers.fire)
          ],
          [
            "기억할 물건",
            Array.isArray(answers.keepsakes)
              ? answerLabel("keepsakes", answers.keepsakes) ||
                "선택 없음"
              : "확인 불가"
          ],
          [
            "마에로",
            displayAnswer("maero", answers.maero)
          ],
          ["성별", displayAnswer("gender", answers.gender)],
          ["연령대", displayAnswer("age", answers.age)],
          ["거주 지역", displayAnswer("region", answers.region)],
          ["기념품 구매 경험", displayAnswer("souvenir", answers.souvenir)],
          ["장면과 어울림", displayAnswer("fit", answers.fit)],
          [
            "키링 적정 가격",
            displayAnswer("price", answers.price)
          ],
          ["바라는 점", answers.comment || "없음"],
          ["물 재생 초", playback(record, "ggng8MTKaH0")],
          ["불 재생 초", playback(record, "vWOqk1XbdB4")],
          [
            "본 사진",
            record.evidence?.photos?.viewedIds?.length || 0
          ],
          [
            "넘겨 본 사진",
            record.evidence?.photos?.browsedIds?.length || 0
          ],
          [
            "정보 펼침",
            record.evidence?.info?.openCount || 0
          ],
          [
            "소식 동의",
            answers.emailConsent
              ? "동의"
              : "동의 없음"
          ]
        ];

        const hasReceivedAt =
          record.receivedAt !== undefined &&
          record.receivedAt !== null &&
          record.receivedAt !== "";
        const receivedDate = new Date(
          hasReceivedAt ? record.receivedAt : NaN
        );
        const validDate = Number.isFinite(receivedDate.getTime());

        return (
          <details
            key={record.id}
            className="ios-admin-response"
          >
            <summary>
              <span className="ios-admin-summary-copy">
                <time
                  dateTime={
                    validDate
                      ? receivedDate.toISOString()
                      : undefined
                  }
                >
                  {formatDate(record.receivedAt)}
                </time>

                <span>응답 상세 펼침</span>
              </span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="m6 9 6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </summary>

            <dl className="ios-admin-values">
              {rows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </details>
        );
      })}
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState("");
  const [records, setRecords] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [view, setView] = useState("all");
  const [channelFieldKey, setChannelFieldKey] = useState("");
  const [today, setToday] = useState(() => dayKey(new Date()));
  const [csvError, setCsvError] = useState("");

  const busyRef = useRef(false);

  useEffect(() => {
    function updateToday() {
      setToday(dayKey(new Date()));
    }

    const timer = window.setInterval(updateToday, 60000);

    document.addEventListener(
      "visibilitychange",
      updateToday
    );

    return () => {
      window.clearInterval(timer);

      document.removeEventListener(
        "visibilitychange",
        updateToday
      );
    };
  }, []);

  const channelFields = useMemo(
    () => discoverChannelFields(records),
    [records]
  );

  const channelField = channelFields.find(
    (field) => field.key === channelFieldKey
  );

  const todayRecords = useMemo(
    () =>
      records.filter(
        (record) => dayKey(record.receivedAt) === today
      ),
    [records, today]
  );

  const channelGroups = useMemo(
    () =>
      channelField
        ? groupByChannel(records, channelField.path)
        : [],
    [records, channelField]
  );

  async function load(event) {
    event.preventDefault();

    if (busyRef.current) return;

    if (isRemote && !token.trim()) {
      setError("관리자 토큰 입력 필요");
      return;
    }

    busyRef.current = true;
    setBusy(true);
    setError("");
    setCsvError("");

    try {
      const result = await loadResponses(token.trim());

      /*
       * 원문과 같은 record 배열 계약만 허용합니다.
       * 새 응답 래퍼나 DB 행 포맷을 임의로 가정하지 않습니다.
       */
      if (
        !Array.isArray(result) ||
        result.some(
          (record) =>
            !record ||
            typeof record !== "object" ||
            Array.isArray(record)
        )
      ) {
        throw new Error(
          "응답 목록 형식 확인 불가"
        );
      }

      setRecords(result);
      setLoaded(true);
      setChannelFieldKey("");
    } catch (caught) {
      setError(
        caught?.message ||
          "응답 조회 실패"
      );

      setRecords([]);
      setLoaded(false);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  function exportCSV() {
    setCsvError("");

    try {
      /*
       * 화면 필터와 무관하게 기존처럼 전체 records를 전달합니다.
       * CSV 생성과 API 요청 방식은 기존 함수가 담당합니다.
       */
      downloadCSV(records);
    } catch (caught) {
      setCsvError(
        caught?.message ||
          "CSV 다운로드 실패"
      );
    }
  }

  const selectedRecords =
    view === "today" ? todayRecords : records;

  return (
    <main className="admin-page container">
      <a className="text-link" href="./">
        설문 화면으로 이동
      </a>

      <header className="section-heading">
        <h1>남겨 준 마음 확인</h1>

        <p>
          {isRemote
            ? "서버에 저장된 응답을 관리자 토큰으로 확인"
            : "이 브라우저에 저장된 응답만 표시함. 다른 기기의 응답은 합산 제외임."}
        </p>
      </header>

      <form className="admin-login" onSubmit={load}>
        {isRemote && (
          <div className="input-group">
            <label htmlFor="admin-token">
              관리자 토큰 입력
            </label>

            <input
              id="admin-token"
              type="password"
              value={token}
              autoComplete="off"
              spellCheck={false}
              aria-describedby="admin-token-help"
              onChange={(event) =>
                setToken(event.target.value)
              }
            />

            <p id="admin-token-help" className="helper">
              토큰은 이 화면의 메모리에서만 사용함.
            </p>
          </div>
        )}

        <button
          type="submit"
          className="button button-blue"
          disabled={busy}
          aria-busy={busy}
        >
          {busy
            ? "응답 조회 중"
            : loaded
              ? "응답 재조회"
              : "응답 조회"}
        </button>

        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
      </form>

      {loaded && (
        <>
          <div
            className="ios-admin-segments"
            role="group"
            aria-label="응답 보기 방식"
          >
            {views.map((item) => (
              <button
                key={item.value}
                type="button"
                className="ios-admin-segment"
                aria-pressed={view === item.value}
                aria-controls="admin-response-list"
                onClick={() => setView(item.value)}
              >
                <CheckIcon />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="admin-stats ios-admin-group">
            <div className="stat-card">
              <span>불러온 응답</span>
              <strong>{records.length}개</strong>
            </div>

            <div className="stat-card">
              <span>처음 마음 평균</span>
              <strong>{average(records, "before")}</strong>
            </div>

            <div className="stat-card">
              <span>지금 마음 평균</span>
              <strong>{average(records, "after")}</strong>
            </div>
          </div>

          <div className="admin-toolbar">
            <h2>응답 현황</h2>

            <button
              type="button"
              className="button button-blue"
              disabled={!records.length}
              onClick={exportCSV}
            >
              전체 항목 CSV 다운로드
            </button>
          </div>

          <p>
            CSV 수록 내용은 답변과 이메일임. 동의 여부와 노출 기록 외에
            최초 점수 선택 시점의 기록도 수록함.
            보관은 권한 있는 팀원으로 제한
          </p>

          {csvError && (
            <p className="field-error" role="alert">
              {csvError}
            </p>
          )}

          {view === "today" && (
            <p className="helper">
              한국 시간 {today} 제출 응답 표시
            </p>
          )}

          {view === "channels" && channelFields.length > 0 && (
            <fieldset className="admin-channel-fields">
              <legend>채널 필드</legend>

              <div className="choice-options">
                {channelFields.map((field, index) => (
                  <label
                    key={field.key}
                    className={`choice ${
                      channelFieldKey === field.key
                        ? "is-selected"
                        : ""
                    }`}
                    htmlFor={`admin-channel-field-${index}`}
                  >
                    <input
                      id={`admin-channel-field-${index}`}
                      type="radio"
                      name="admin-channel-field"
                      value={field.key}
                      checked={channelFieldKey === field.key}
                      onChange={() =>
                        setChannelFieldKey(field.key)
                      }
                    />

                    <ChoiceIndicator />

                    <span className="choice-label">
                      <code>{field.label}</code>
                    </span>
                  </label>
                ))}
              </div>

              <p className="helper">
                실제 응답에 존재하는 필드임.
                채널에 해당하는 유입 필드 선택 필요
              </p>
            </fieldset>
          )}

          {view === "channels" &&
            records.length > 0 &&
            !channelField && (
              <p className="helper" role="status">
                {channelFields.length
                  ? "채널 필드 선택 전에는 전체 응답 표시"
                  : "채널 필드 확인 불가로 전체 응답 표시"}
              </p>
            )}

          <div id="admin-response-list">
            {!records.length ? (
              <p className="ios-admin-empty" role="status">
                저장된 응답 없음
              </p>
            ) : view === "channels" && channelField ? (
              channelGroups.map((group) => (
                <section
                  key={group.key}
                  className="ios-admin-section"
                  aria-label={`${group.label} 응답`}
                >
                  <h3>
                    {group.label} ({group.records.length}개)
                  </h3>

                  <ResponseList records={group.records} />
                </section>
              ))
            ) : selectedRecords.length ? (
              <section
                className="ios-admin-section"
                aria-label={
                  view === "today"
                    ? "오늘 제출된 응답"
                    : "전체 응답"
                }
              >
                <h3>
                  {view === "today" ? "오늘" : "전체"}{" "}
                  ({selectedRecords.length}개)
                </h3>

                <ResponseList records={selectedRecords} />
              </section>
            ) : (
              <p className="ios-admin-empty" role="status">
                오늘 제출된 응답 없음
              </p>
            )}
          </div>

          <aside className="admin-notice">
            <h2>해석 시 확인 사항</h2>

            <p>
              처음 마음은 축제 소개를 본 뒤에 답한 점수일 수 있음.
              최초 점수 선택 시점의 노출 기록을 함께 확인해야 함.
            </p>

            <p>
              재생 시간과 화면 노출은 관심이나 이해를 보장하지 않음.
              반복 재생과 재생 속도의 영향도 확인 필요
            </p>
          </aside>
        </>
      )}
    </main>
  );
}