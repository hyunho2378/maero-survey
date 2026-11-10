import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  config,
  emailEnabled,
  isRemote,
  publicAsset
} from "../config.js";

import {
  initialAnswers,
  questions,
  validateAnswers
} from "../data/questions.js";

import { festival, sources, videos } from "../data/festival.js";

import {
  createSubmissionId,
  submitResponse
} from "../lib/submit.js";

import QuestionCard, {
  ChoiceIndicator
} from "./QuestionCard.jsx";

import VideoCard from "./VideoCard.jsx";
import PrivacyNotice from "./PrivacyNotice.jsx";
import Result from "./Result.jsx";
import HelpCard, { SourceLink } from "./HelpCard.jsx";
import Keepsakes from "./Keepsakes.jsx";
import Worldview from "./Worldview.jsx";

import { Phrase } from "./Stickers.jsx";

/*
 * 표시용 순서입니다.
 * 문항 렌더 순서, 유효성 검사와 제출 데이터는 변경하지 않습니다.
 */
const progressQuestionIds = Object.freeze([
  "awareness",
  "before",
  "water",
  "fire",
  "keepsakes",
  "maero",
  "after",
  "companion"
]);

function hasVisibleAnswer(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return (
    value !== undefined &&
    value !== null &&
    value !== false
  );
}

function SectionCard({ title, description }) {
  return (
    <div className="form-section-card">
      <h3>
        <Phrase text={title} />
      </h3>

      {description && (
        <p>
          <Phrase text={description} />
        </p>
      )}
    </div>
  );
}

export default function Survey({ tracker }) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

  const [progressVisible, setProgressVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const sectionRef = useRef(null);
  const progressWarningRef = useRef(false);

  const pendingRef = useRef(null);
  const busyRef = useRef(false);
  const submitButtonRef = useRef(null);

  const baselineRef = useRef(null);
  const afterChangedAtRef = useRef(null);

  /*
   * 화면 위치를 읽는 표현 전용 처리입니다.
   * tracker, answers, baseline, 제출 데이터는 수정하지 않습니다.
   */
  useEffect(() => {
    if (result) {
      setProgressVisible(false);
      return undefined;
    }

    const section = sectionRef.current;

    if (!section) {
      if (!progressWarningRef.current) {
        progressWarningRef.current = true;

        console.warn(
          "[Survey] 진행 표시의 sectionRef 없음. " +
            "설문 section 연결 확인 필요"
        );
      }

      return undefined;
    }

    let frame = 0;

    function measure() {
      frame = 0;

      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop || 0;
      const viewportHeight = viewport?.height || window.innerHeight;

      const header = document.querySelector(".site-header");
      const headerBottom = header
        ? Math.max(0, header.getBoundingClientRect().bottom)
        : 0;

      const visibleTop = Math.max(viewportTop, headerBottom);
      const visibleBottom = viewportTop + viewportHeight;
      const sectionRectangle = section.getBoundingClientRect();

      const visible =
        sectionRectangle.top < visibleBottom &&
        sectionRectangle.bottom > visibleTop;

      setProgressVisible(visible);

      if (!visible) return;

      const referenceLine =
        visibleTop +
        Math.max(0, visibleBottom - visibleTop) * 0.3;

      let nextStep = 1;

      for (let index = 0; index < progressQuestionIds.length; index += 1) {
        const id = progressQuestionIds[index];
        const group = document.getElementById(`q-${id}`);

        if (
          group &&
          group.getBoundingClientRect().top <= referenceLine
        ) {
          nextStep = index + 1;
        }
      }

      setCurrentStep(nextStep);
    }

    function scheduleMeasure() {
      if (frame) return;

      frame = window.requestAnimationFrame(measure);
    }

    measure();

    window.addEventListener("scroll", scheduleMeasure, {
      passive: true
    });

    window.addEventListener("resize", scheduleMeasure);

    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", scheduleMeasure);
    viewport?.addEventListener("scroll", scheduleMeasure);

    let observer = null;

    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(scheduleMeasure);
      observer.observe(section);
    }

    return () => {
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);

      viewport?.removeEventListener("resize", scheduleMeasure);
      viewport?.removeEventListener("scroll", scheduleMeasure);

      observer?.disconnect();

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [result]);

  function updateFocusedStep(event) {
    const group = event.target.closest?.(".survey-question");

    if (!group) return;

    const index = progressQuestionIds.findIndex(
      (id) => group.id === `q-${id}`
    );

    if (index >= 0) {
      setCurrentStep(index + 1);
    }
  }

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

    if (id === "after") {
      afterChangedAtRef.current = now;
    }

    setAnswers((current) => {
      const next = { ...current, [id]: value };

      if (id === "email" && !String(value).trim()) {
        next.emailConsent = false;
      }

      return next;
    });

    setErrors((current) => {
      const next = { ...current };
      delete next[id];

      if (id === "email" && !String(value).trim()) {
        delete next.emailConsent;
      }

      return next;
    });
  }

  function focusFirstError(nextErrors) {
    const first = Object.keys(nextErrors)[0];

    window.requestAnimationFrame(() => {
      const group = document.getElementById(`q-${first}`);
      const input =
        group?.querySelector("input") ||
        document.getElementById(first);

      if (input) {
        input.focus();
      } else {
        group?.focus();
      }
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (busyRef.current) return;

    if (!pendingRef.current) {
      const nextErrors = validateAnswers(answers, {
        allowEmail: emailEnabled
      });

      setErrors(nextErrors);

      if (Object.keys(nextErrors).length) {
        setMessage("미응답 문항 확인 필요함.");
        focusFirstError(nextErrors);
        return;
      }

      const submittedAt = new Date().toISOString();
      const email = answers.email.trim();

      const normalizedAnswers = {
        ...answers,
        email,
        emailConsent: Boolean(email && answers.emailConsent)
      };

      pendingRef.current = {
        schemaVersion: config.schemaVersion,
        id: createSubmissionId(),
        submittedAt,
        answers: normalizedAnswers,
        baseline: baselineRef.current,
        afterLastChangedAt: afterChangedAtRef.current,
        scoreDelta: answers.after - answers.before,
        evidence: tracker.finish(),

        consent: {
          version: config.privacyVersion,
          newsletter: normalizedAnswers.emailConsent,
          at: normalizedAnswers.emailConsent
            ? submittedAt
            : null
        }
      };

      setLocked(true);
    }

    busyRef.current = true;
    setSending(true);
    setMessage("");

    try {
      const receipt = await submitResponse(
        pendingRef.current
      );

      setResult({
        payload: pendingRef.current,
        receipt
      });
    } catch (error) {
      setMessage(error.message);
      window.requestAnimationFrame(() => {
        submitButtonRef.current?.focus();
      });
    } finally {
      busyRef.current = false;
      setSending(false);
    }
  }

  function renderQuestion(id) {
    return (
      <QuestionCard
        question={questions[id]}
        value={answers[id]}
        onChange={changeAnswer}
        error={errors[id]}
      />
    );
  }

  const answeredCount = progressQuestionIds.filter((id) =>
    hasVisibleAnswer(answers[id])
  ).length;

  /* 표현 전용: 제출 버튼의 떠오름 상태에만 씁니다. */
  const allAnswered = answeredCount === progressQuestionIds.length;

  const hasValidationErrors = Object.keys(errors).length > 0;

  const hideValidationSummary =
    !locked && hasValidationErrors;

  return (
    <section
      ref={sectionRef}
      id="survey"
      className="survey-section survey-scene main-form-survey"
      aria-labelledby={result ? "result-title" : "survey-title"}
    >
      <div className="survey-container">
        {result ? (
          <Result
            payload={result.payload}
            receipt={result.receipt}
          />
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div
              className="form-header-card"
              data-track-section="survey-head"
            >
              <h2 id="survey-title">
                <Phrase text="설문 응답" />
              </h2>

              <p className="lead">
                <Phrase
                  text={`영상 ${videos.length}편 시청 후 문항 ${progressQuestionIds.length}개에 응답`}
                />
              </p>

              <p>영상 재생이 어려워도 답변 가능함.</p>

              <PrivacyNotice compact />

              <a className="text-link" href="#privacy">
                개인정보 안내 전문
              </a>
            </div>

            {progressVisible && (
              <div
                className="survey-progress survey-progress-glass"
                role="region"
                aria-label="설문 진행"
              >
                <div className="survey-progress-inner">
                  <div className="survey-progress-heading">
                    <p>
                      현재 {currentStep} /{" "}
                      {progressQuestionIds.length}단계
                    </p>

                    <p id="survey-progress-label">
                      답변 문항 {answeredCount} /{" "}
                      {progressQuestionIds.length}
                    </p>
                  </div>

                  <div
                    className="survey-progress-meter"
                    role="progressbar"
                    aria-labelledby="survey-progress-label"
                    aria-valuemin={0}
                    aria-valuemax={progressQuestionIds.length}
                    aria-valuenow={answeredCount}
                    aria-valuetext={
                      `${progressQuestionIds.length}문항 중 ` +
                      `${answeredCount}문항 답변 완료`
                    }
                  >
                    {/* 채움은 CSS에서 transform: scaleX 로만 움직입니다. */}
                    <span
                      className="survey-progress-track"
                      aria-hidden="true"
                    >
                      <span
                        className="survey-progress-fill"
                        style={{
                          "--survey-progress-ratio":
                            answeredCount /
                            progressQuestionIds.length
                        }}
                      />
                    </span>
                  </div>
                </div>
              </div>
            )}

            <fieldset
              className="form-body"
              disabled={locked || sending}
              onFocusCapture={updateFocusedStep}
            >
              <legend className="sr-only">
                설문 문항
              </legend>

              <SectionCard
                title="시청 전 응답"
                description="영상 시청 전 상태 기준 응답"
              />

              {renderQuestion("awareness")}
              {renderQuestion("before")}

              <HelpCard id="help-festival" title="춘천마임축제 소개">
                <p>{festival.introduction}</p>

                <p>
                  지난 축제 정보임. 정보 기준일 {festival.checkedAt}
                </p>

                <SourceLink href={sources.festival}>
                  춘천마임축제 소개 출처
                </SourceLink>
              </HelpCard>

              <SectionCard
                title="물의 장면"
                description="영상 시청 후 응답"
              />

              <VideoCard
                video={videos[0]}
                tracker={tracker}
              />

              <HelpCard id="help-water" title="물의 장면 그림">
                <Worldview ids={["water"]} />
              </HelpCard>

              {renderQuestion("water")}

              <SectionCard
                title="불과 밤의 장면"
                description="영상 시청 후 응답 입력"
              />

              <VideoCard
                video={videos[1]}
                tracker={tracker}
              />

              <HelpCard id="help-fire" title="불의 장면 그림">
                <Worldview ids={["fire"]} />
              </HelpCard>

              {renderQuestion("fire")}

              <SectionCard
                title="기억에 남는 모습"
                description="기념품 그림 확인 후 응답"
              />

              <HelpCard
                id="help-keepsakes"
                title="기념품 그림 3종"
              >
                <Keepsakes />
              </HelpCard>

              {renderQuestion("keepsakes")}
              {renderQuestion("maero")}

              <SectionCard
                title="시청 후 응답"
                description="모든 장면 확인 후 현재 상태 기준 응답"
              />

              {renderQuestion("after")}
              {renderQuestion("companion")}

              <section
                id="newsletter"
                className="question-card newsletter-card"
                aria-labelledby="newsletter-title"
                data-track-section="newsletter"
              >
                <h3 id="newsletter-title">소식 신청</h3>

                <p>
                  <Phrase text="축제 관련 소식 수신 신청이며 이메일 입력은 선택임." />
                </p>

                <div
                  id="q-email"
                  className="input-group"
                >
                  <label htmlFor="email">
                    이메일 입력 (선택)
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    maxLength={254}
                    value={answers.email}
                    disabled={!emailEnabled}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={
                      errors.email
                        ? "email-error"
                        : "email-help"
                    }
                    onChange={(event) =>
                      changeAnswer(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder={
                      emailEnabled
                        ? "이메일 주소 입력"
                        : "이메일 입력 불가"
                    }
                  />

                  <p
                    id="email-help"
                    className="helper"
                  >
                    {emailEnabled
                      ? "비워 두어도 설문 제출 가능함."
                      : "이메일 수집 중지 상태이며 설문 참여는 가능함."}
                  </p>

                  {errors.email && (
                    <p
                      id="email-error"
                      className="field-error"
                      role="alert"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                {answers.email.trim() && emailEnabled && (
                  <div id="q-emailConsent">
                    <label
                      className={`choice consent-choice ${
                        answers.emailConsent
                          ? "is-selected"
                          : ""
                      }`}
                    >
                      <input
                        id="emailConsent"
                        type="checkbox"
                        checked={answers.emailConsent}
                        onChange={(event) =>
                          changeAnswer(
                            "emailConsent",
                            event.target.checked
                          )
                        }
                        aria-invalid={Boolean(
                          errors.emailConsent
                        )}
                        aria-describedby={
                          errors.emailConsent
                            ? "email-consent-error"
                            : undefined
                        }
                      />

                      <ChoiceIndicator />

                      <span className="choice-label">
                        버터와플의 축제 관련 소식 발송을 위한
                        이메일 {config.retentionDays}일 보관
                        및 사용에 동의함.
                      </span>
                    </label>

                    <p className="helper">
                      동의하지 않을 경우 이메일을 지우면 설문 제출
                      가능함. 문의와 철회 연락처{" "}
                      {config.privacyContact}
                    </p>

                    {errors.emailConsent && (
                      <p
                        id="email-consent-error"
                        className="field-error validation-detail"
                        role="alert"
                      >
                        {errors.emailConsent}
                      </p>
                    )}
                  </div>
                )}
              </section>
            </fieldset>

            <div
              className="submit-area"
              data-ready={allAnswered ? "true" : "false"}
            >
              {message && (
                <div
                  className={`form-message ${
                    hideValidationSummary
                      ? "validation-summary sr-only"
                      : ""
                  }`}
                  role="alert"
                >
                  <p>{message}</p>

                  {locked && (
                    <p>
                      같은 응답으로 재전송하여 중복 방지함.
                      새로고침 없이 아래 버튼으로 재시도
                    </p>
                  )}
                </div>
              )}

              <button
                ref={submitButtonRef}
                type="submit"
                className="button button-blue submit-button"
                disabled={sending}
                aria-busy={sending}
              >
                {sending
                  ? "응답 전송 중"
                  : locked
                    ? "같은 응답으로 재시도"
                    : isRemote
                      ? "답변 제출"
                      : "이 기기에 답변 저장"}
              </button>

              <p className="helper">
                <Phrase text="제출 시 답변과 기록이 함께 저장됨." />
              </p>
            </div>
          </form>
        )}
      </div>

      {/* 장식 전용. 데스크톱에서만 보임. */}
      <img
        className="survey-maero"
        src={publicAsset("img/3d_maero_basic.png")}
        alt=""
        aria-hidden="true"
        width="96"
        decoding="async"
        loading="lazy"
        draggable="false"
      />
    </section>
  );
}