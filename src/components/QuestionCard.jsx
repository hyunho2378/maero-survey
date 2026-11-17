import { StarSticker } from "./Stickers.jsx";

/*
 * 입력 상태는 native input이 담당합니다.
 * SVG는 화면 표시만 담당하며 접근성 트리에서는 제외합니다.
 */
export function ChoiceIndicator() {
  return (
    <span className="choice-indicator" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        focusable="false"
      >
        <circle
          className="choice-indicator-ring"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
        />

        <circle
          className="choice-indicator-fill"
          cx="12"
          cy="12"
          r="11"
          fill="currentColor"
        />

        <path
          className="choice-indicator-check"
          d="m7 12 3.2 3.2L17 8.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function QuestionCard({
  question,
  value,
  onChange,
  error
}) {
  const hintId = `${question.id}-hint`;
  const errorId = `${question.id}-error`;
  const requirementId = `${question.id}-requirement`;

  const scaleLabelsId = `${question.id}-scale-labels`;

  const describedBy = [
    requirementId,
    question.type === "scale" ? scaleLabelsId : "",
    question.hint ? hintId : "",
    error ? errorId : ""
  ]
    .filter(Boolean)
    .join(" ");

  const options =
    question.type === "scale"
      ? [1, 2, 3, 4, 5].map((number) => ({
          value: number,
          label: String(number)
        }))
      : question.options;

  function toggle(optionValue) {
    if (question.type !== "checkbox") {
      onChange(question.id, optionValue);
      return;
    }

    const selected = Array.isArray(value) ? value : [];

    onChange(
      question.id,
      selected.includes(optionValue)
        ? selected.filter((item) => item !== optionValue)
        : [...selected, optionValue]
    );
  }

  return (
    <fieldset
      id={`q-${question.id}`}
      className={`question-card survey-question ${
        error ? "has-error" : ""
      }`}
      aria-describedby={describedBy}
      data-track-section={`question-${question.id}`}
    >
      <legend>
        <span className="question-heading">
          <span
            className="question-number"
            aria-hidden="true"
          >
            <StarSticker size="md" tilt="left" />
          </span>

          <span className="question-heading-copy">
            <span className="question-title">
              {question.title}
            </span>
          </span>
        </span>
      </legend>

      <div
        className={
          question.type === "scale"
            ? "scale-options"
            : "choice-options"
        }
      >
        {options.map((option) => {
          const checked =
            question.type === "checkbox"
              ? Array.isArray(value) &&
                value.includes(option.value)
              : value === option.value;

          const inputId = `${question.id}-${option.value}`;
          const isScale = question.type === "scale";

          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={`choice ${
                checked ? "is-selected" : ""
              } ${isScale ? "scale-choice" : ""}`}
            >
              <input
                id={inputId}
                type={
                  question.type === "checkbox"
                    ? "checkbox"
                    : "radio"
                }
                name={question.id}
                value={option.value}
                checked={checked}
                onChange={() => toggle(option.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy}
                required={
                  question.required &&
                  question.type !== "checkbox"
                }
              />

              {!isScale && <ChoiceIndicator />}

              <span className="choice-label">
                {option.label}
              </span>

              {isScale && (
                <svg
                  className="scale-selected-mark"
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
              )}
            </label>
          );
        })}
      </div>

      {question.type === "scale" && (
        <div className="scale-labels" id={scaleLabelsId}>
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

      <div className="question-footer">
        <p
          id={requirementId}
          className="question-requirement"
        >
          {question.required
            ? "필수 문항"
            : "선택 문항"}
        </p>

        {question.hint && (
          <p id={hintId} className="helper">
            {question.hint}
          </p>
        )}
      </div>

      {error && (
        <p
          id={errorId}
          className="field-error validation-detail"
          role="alert"
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}