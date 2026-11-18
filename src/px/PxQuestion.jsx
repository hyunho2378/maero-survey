/*
 * 구글 폼형 문항 카드(직접 작성). 입력 상태는 기본 input이 맡고
 * 표시는 직접 만든 표시 부품이 맡음. OS 기본 선택 화면 없음.
 */
function Mark({ type }) {
  return (
    <span className={`px-mark is-${type}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="24" height="24" focusable="false">
        <path d="m6 12.5 4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
      </svg>
    </span>
  );
}

import { Img } from "./ui.jsx";

/* 그림을 함께 보여 주는 문항(마에로 모습 선택) */
const optionImages = {
  maero: {
    basic: "img/orig/maero_basic.png",
    blue: "img/orig/maero_blue.png",
    red: "img/orig/maero_red.png"
  }
};

export function ErrorIcon() {
  return (
    <svg className="px-error-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M12 3 22 20H2Z" fill="currentColor" />
      <path d="M12 9v5M12 16.5v1.5" stroke="var(--px-surface)" strokeWidth="2" />
    </svg>
  );
}

export default function PxQuestion({ question, number, value, onChange, error }) {
  const hintId = `${question.id}-hint`;
  const errorId = `${question.id}-error`;
  const requirementId = `${question.id}-requirement`;
  const scaleLabelsId = `${question.id}-scale-labels`;
  const isScale = question.type === "scale";
  const isCheckbox = question.type === "checkbox";
  const isText = question.type === "text";

  const describedBy = [requirementId, isScale ? scaleLabelsId : "", error ? errorId : ""]
    .filter(Boolean)
    .join(" ");

  const options = isText ? [] : isScale
    ? [1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))
    : question.options;

  function toggle(optionValue) {
    if (!isCheckbox) {
      onChange(question.id, optionValue);
      return;
    }
    const selected = Array.isArray(value) ? value : [];
    onChange(
      question.id,
      selected.includes(optionValue) ? selected.filter((item) => item !== optionValue) : [...selected, optionValue]
    );
  }

  return (
    <div
      id={`q-${question.id}`}
      role="group"
      aria-labelledby={`${question.id}-title`}
      className={`px-q survey-question ${error ? "has-error" : ""}`}
      aria-describedby={describedBy}
      data-track-section={`question-${question.id}`}
    >
      <div className="px-q-legend">
        <span className="px-q-number" aria-hidden="true">
          {String(number).padStart(2, "0")}
        </span>
        <span id={`${question.id}-title`} className="px-q-title">
          {question.title}
          {question.required && (
            <span className="px-star" aria-hidden="true">
              *
            </span>
          )}
        </span>
      </div>

      <p id={requirementId} className="px-q-req">
        {question.required ? "필수" : "선택"}
      </p>

      {isText && (
        <textarea
          id={`text-${question.id}`}
          className="px-input px-textarea"
          rows={3}
          maxLength={question.maxLength || 500}
          value={typeof value === "string" ? value : ""}
          placeholder="내 답변"
          aria-label={question.title}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(question.id, event.target.value)}
        />
      )}

      <div hidden={isText} className={isScale ? "px-scale" : optionImages[question.id] ? "px-options is-pictures" : "px-options"}>
        {options.map((option) => {
          const checked = isCheckbox
            ? Array.isArray(value) && value.includes(option.value)
            : value === option.value;
          const inputId = `${question.id}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={`px-choice ${checked ? "is-selected" : ""} ${isScale ? "is-scale" : ""}`}
            >
              <input
                id={inputId}
                type={isCheckbox ? "checkbox" : "radio"}
                name={question.id}
                value={option.value}
                checked={checked}
                onChange={() => toggle(option.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy}
                required={question.required && !isCheckbox}
              />
              {optionImages[question.id]?.[option.value] && (
                <span className="px-choice-picture" aria-hidden="true">
                  <Img file={optionImages[question.id][option.value]} width={600} height={600} />
                </span>
              )}
              {!isScale && <Mark type={isCheckbox ? "box" : "round"} />}
              <span className="px-choice-label">{option.label}</span>
            </label>
          );
        })}
      </div>

      {isScale && (
        <div className="px-scale-labels" id={scaleLabelsId}>
          <span>
            <span className="sr-only">1점 </span>
            {question.low}
          </span>
          <span>
            <span className="sr-only">5점 </span>
            {question.high}
          </span>
        </div>
      )}



      {question.required && (
        <p id={errorId} className={`px-q-error ${error ? "" : "is-empty"}`} aria-live="polite">
          {error ? <ErrorIcon /> : null}
          {error || "\u00a0"}
        </p>
      )}
      {!question.required && error && (
        <p id={errorId} className="px-q-error">
          <ErrorIcon />
          {error}
        </p>
      )}
    </div>
  );
}
