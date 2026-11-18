import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { config, emailEnabled, isRemote } from "../config.js";
import { initialAnswers, questions, validateAnswers } from "../data/questions.js";
import { videos } from "../data/festival.js";
import { createSubmissionId, submitResponse } from "../lib/submit.js";
import PxQuestion, { ErrorIcon } from "./PxQuestion.jsx";
import PxVideo from "./PxVideo.jsx";
import PxResult from "./PxResult.jsx";
import { surveyCopy } from "./content.js";
import { Img, Lines } from "./ui.jsx";

/*
 * 설문 구간(직접 작성). 응답 검증, 기준선, 시청 기록, 제출 데이터는 v34 Survey 로직을 그대로 씀.
 * 화면은 구글 폼형 세로 카드 구조.
 */
const order = ["gender", "age", "region", "awareness", "souvenir", "before", "water", "fire", "maero", "fit", "keepsakes", "price", "comment"];


const pages = [
  { ids: ["gender", "age", "region", "awareness", "souvenir", "before"] },
  { ids: ["water", "fire", "maero", "fit", "keepsakes", "price", "comment"] }
];

function answered(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return value !== undefined && value !== null && value !== false;
}

function ScenePair({ art, maero, label }) {
  return (
    <figure className="px-scene">
      <Img file={art} alt="" width={1152} height={778} />
      <Img file={maero} alt={label} width={900} height={800} />
    </figure>
  );
}

function Stage({ stage }) {
  return (
    <section className="px-stage">
      <div className="px-stage-copy">
        <h3 className="px-stage-name">{stage.name}</h3>
        {stage.guide ? <p className="px-stage-guide">{stage.guide}</p> : null}
      </div>
    </section>
  );
}

export default function PxSurvey({ tracker, onProgress }) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);

  const sectionRef = useRef(null);
  const pendingRef = useRef(null);
  const busyRef = useRef(false);
  const submitButtonRef = useRef(null);
  const baselineRef = useRef(null);
  const afterChangedAtRef = useRef(null);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previous;
  }, [pageIndex, result]);

  const answeredCount = order.filter((id) => answered(answers[id])).length;

  /* 설문 구간이 화면에 있을 때만 헤더 진행 표시를 켬 */
  const [sectionVisible, setSectionVisible] = useState(false);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || result) {
      setSectionVisible(false);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setSectionVisible(entry.isIntersecting),
      { rootMargin: "-20% 0px -20% 0px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [result]);
  useEffect(() => {
    onProgress({ visible: sectionVisible && !result, answered: answeredCount, total: order.length });
  }, [sectionVisible, result, answeredCount, onProgress]);

  function changeAnswer(id, value) {
    if (locked || busyRef.current) return;
    const now = new Date().toISOString();
    if (id === "before") {
      if (!baselineRef.current) {
        baselineRef.current = {
          firstSelectedAt: now,
          firstValue: value,
          lastChangedAt: now,
          exposureAtFirstSelection: tracker.snapshot()
        };
      } else {
        baselineRef.current.lastChangedAt = now;
      }
    }
    if (id === "after") afterChangedAtRef.current = now;

    setAnswers((current) => {
      const next = { ...current, [id]: value };
      if (id === "email" && !String(value).trim()) next.emailConsent = false;
      return next;
    });
    setErrors((current) => {
      const next = { ...current };
      delete next[id];
      if (id === "email" && !String(value).trim()) delete next.emailConsent;
      return next;
    });
  }

  function focusFirstError(nextErrors) {
    const screenOrder = [...order, "email", "emailConsent"];
    const first = screenOrder.find((id) => nextErrors[id]) || Object.keys(nextErrors)[0];
    window.requestAnimationFrame(() => {
      const group = document.getElementById(`q-${first}`);
      const input = group?.querySelector("input") || document.getElementById(first);
      if (input) input.focus();
      else group?.focus();
    });
  }

  function goNext() {
    const ids = pages[pageIndex].ids;
    const all = validateAnswers(answers, { allowEmail: emailEnabled });
    const pageErrors = Object.fromEntries(Object.entries(all).filter(([key]) => ids.includes(key)));
    setErrors((current) => ({ ...current, ...pageErrors }));
    if (Object.keys(pageErrors).length) {
      setMessage("");
      focusFirstError(pageErrors);
      return;
    }
    setMessage("");
    setPageIndex((value) => Math.min(value + 1, pages.length - 1));
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function goBack() {
    setMessage("");
    setPageIndex((value) => Math.max(value - 1, 0));
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (busyRef.current) return;
    if (pageIndex < pages.length - 1) {
      goNext();
      return;
    }

    if (!pendingRef.current) {
      const nextErrors = validateAnswers(answers, { allowEmail: emailEnabled });
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) {
        setMessage(`아직 답하지 않은 문항이 ${Object.keys(nextErrors).length}개 있어요.`);
        focusFirstError(nextErrors);
        return;
      }
      const submittedAt = new Date().toISOString();
      const email = answers.email.trim();
      const normalizedAnswers = { ...answers, email, emailConsent: Boolean(email && answers.emailConsent) };
      pendingRef.current = {
        schemaVersion: config.schemaVersion,
        id: createSubmissionId(),
        submittedAt,
        answers: normalizedAnswers,
        baseline: baselineRef.current,
        afterLastChangedAt: afterChangedAtRef.current || submittedAt,
        scoreDelta: null,
        evidence: tracker.finish(),
        consent: {
          version: config.privacyVersion,
          newsletter: normalizedAnswers.emailConsent,
          at: normalizedAnswers.emailConsent ? submittedAt : null
        }
      };
      setLocked(true);
    }

    busyRef.current = true;
    setSending(true);
    setMessage("");
    try {
      const receipt = await submitResponse(pendingRef.current);
      setResult({ payload: pendingRef.current, receipt });
      window.requestAnimationFrame(() => {
        sectionRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
      });
    } catch (error) {
      setMessage(error.message);
      window.requestAnimationFrame(() => submitButtonRef.current?.focus());
    } finally {
      busyRef.current = false;
      setSending(false);
    }
  }

  function q(id) {
    return (
      <PxQuestion
        question={questions[id]}
        number={order.indexOf(id) + 1}
        value={answers[id]}
        onChange={changeAnswer}
        error={errors[id]}
      />
    );
  }

  const s = surveyCopy;

  return (
    <section
      ref={sectionRef}
      id="survey"
      className={`px-survey ${result ? "is-result" : ""}`}
      aria-labelledby={result ? "result-title" : "survey-title"}
    >
      {result ? (
        <PxResult payload={result.payload} receipt={result.receipt} />
      ) : (
        <form className="px-form" onSubmit={handleSubmit} noValidate>
          {pageIndex === 0 ? (
            <header className="px-form-head" data-track-section="survey-head">
              <div className="px-form-photos" aria-hidden="true">
                <Img file="img/fest/fest_dance.jpg" width={900} height={600} eager />
                <Img file="img/fest/fest_crowd.jpg" width={900} height={600} eager />
                <Img file="img/fest/fest_night.jpg" width={900} height={600} eager />
              </div>
              <h2 id="survey-title" className="px-form-title">
                <Lines text={surveyCopy.title} />
              </h2>
              <div className="px-form-intro">
                <p>
                  저희는 춘천마임축제의 물과 불 장면을 캐릭터 마에로와 삐삐로로 그려 키링, 엽서 같은 기념품을 만드는 프로젝트를 준비하고 있습니다.
                  이 설문은 축제 영상을 보시고 어떤 장면과 기념품이 마음에 드시는지, 기념품이 있다면 가격은 얼마가 적당한지 알아보려고 만들었습니다.
                </p>
                <p>
                  약 3분이면 마칠 수 있습니다. 이름과 전화번호는 받지 않으며, 응답은 프로젝트 기획 자료로만 사용합니다.
                  소중한 시간 내어 주셔서 감사합니다.
                </p>
              </div>
            </header>
          ) : null}

          <fieldset className="px-form-body" disabled={locked || sending}>
            <legend className="sr-only">설문 문항</legend>

            {pageIndex === 0 && (
              <>
                {q("gender")}
                {q("age")}
                {q("region")}
                {q("awareness")}
                {q("souvenir")}
                {q("before")}
              </>
            )}

            {pageIndex === 1 && (
              <>
                <PxVideo video={videos[0]} tracker={tracker} />
                <ScenePair art="img/orig/postcard_water.jpg" maero="img/orig/maero_blue.png" label="물의 장면 속 블루 마에로" />
                {q("water")}
                <PxVideo video={videos[1]} tracker={tracker} />
                <ScenePair art="img/orig/postcard_fire.jpg" maero="img/orig/maero_red.png" label="불의 장면 속 레드 마에로" />
                {q("fire")}
                {q("maero")}
                {q("fit")}
                <ul className="px-mockups" role="list" data-track-section="festival-mockups">
                  {surveyCopy.mockups.map((item) => (
                    <li key={item.file} className="px-mockup">
                      <Img file={item.file} alt={item.alt} width={1400} height={1050} />
                    </li>
                  ))}
                </ul>
                {q("keepsakes")}
                {q("price")}
                {q("comment")}
                {emailEnabled && (
                  <section id="newsletter" className="px-q px-newsletter" aria-labelledby="newsletter-title" data-track-section="newsletter">
                    <h3 id="newsletter-title" className="px-q-title">축제 소식을 이메일로 받아 보실래요?</h3>
                    <div id="q-email" className="px-field">
                      <label htmlFor="email" className="px-field-label">이메일 주소</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="px-input"
                        autoComplete="email"
                        inputMode="email"
                        maxLength={254}
                        value={answers.email}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? "email-help email-error" : "email-help"}
                        onChange={(event) => changeAnswer("email", event.target.value)}
                        placeholder="내 답변"
                      />
                      <p id="email-help" className="px-q-hint">비워 두어도 제출할 수 있어요.</p>
                      {errors.email && (
                        <p id="email-error" className="px-q-error">
                          <ErrorIcon />
                          {errors.email}
                        </p>
                      )}
                    </div>
                    {answers.email.trim() && (
                      <div id="q-emailConsent" className="px-options">
                        <label htmlFor="emailConsent" className={`px-choice ${answers.emailConsent ? "is-selected" : ""}`}>
                          <input
                            id="emailConsent"
                            type="checkbox"
                            checked={answers.emailConsent}
                            onChange={(event) => changeAnswer("emailConsent", event.target.checked)}
                            aria-invalid={Boolean(errors.emailConsent)}
                            aria-describedby={errors.emailConsent ? "email-consent-error" : undefined}
                          />
                          <span className="px-mark is-box" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="24" height="24" focusable="false">
                              <path d="m6 12.5 4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
                            </svg>
                          </span>
                          <span className="px-choice-label">
                            축제 소식을 보내는 데 이메일을 {config.retentionDays}일 동안 보관하고 쓰는 일에 동의해요.
                          </span>
                        </label>
                        {errors.emailConsent && (
                          <p id="email-consent-error" className="px-q-error">
                            <ErrorIcon />
                            {errors.emailConsent}
                          </p>
                        )}
                      </div>
                    )}
                  </section>
                )}
              </>
            )}
          </fieldset>

          {message && (
            <p className="px-submit-message" role="alert">
              <ErrorIcon />
              {message}
              {locked ? " 같은 답변으로 다시 보내도 중복 저장되지 않아요." : ""}
            </p>
          )}

          <div className="px-nav" data-ready={answeredCount === order.length ? "true" : "false"}>
            <button type="button" className="px-nav-back" onClick={goBack} disabled={pageIndex === 0 || locked || sending}>
              이전
            </button>
            {pageIndex < pages.length - 1 ? (
              <button type="button" className="px-nav-next" onClick={goNext}>
                다음
              </button>
            ) : (
              <button ref={submitButtonRef} type="submit" className="px-nav-next" disabled={sending} aria-busy={sending}>
                {sending ? "보내는 중" : locked ? "같은 답변으로 다시 보내기" : isRemote ? surveyCopy.submitRemote : surveyCopy.submitLocal}
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
