export const questions = {
  awareness: {
    id: "awareness",
    type: "radio",
    required: true,
    title: "춘천마임축제 인지 정도",
    options: [
      { value: "never", label: "처음 접한 축제" },
      { value: "name", label: "이름만 들어본 축제" },
      { value: "know", label: "내용까지 알고 있던 축제" }
    ]
  },

  before: {
    id: "before",
    type: "scale",
    required: true,
    title: "장면 시청 전 방문 의향",
    hint: "문항을 처음 만난 순간의 마음에 해당하는 숫자 선택",
    low: "별로 가고 싶지 않은 마음",
    high: "꼭 가 보고 싶은 마음"
  },

  water: {
    id: "water",
    type: "radio",
    required: true,
    title: "물의 장면을 본 뒤 달라진 마음",
    options: [
      { value: "join", label: "그 안에 함께 있는 경험 희망" },
      { value: "watch", label: "현장에서 구경하고 싶은 마음" },
      { value: "unchanged", label: "아직 큰 변화 없는 상태" },
      { value: "not_watched", label: "영상 미시청" }
    ]
  },

  fire: {
    id: "fire",
    type: "radio",
    required: true,
    title: "불과 밤의 장면을 본 뒤 달라진 마음",
    options: [
      { value: "join", label: "그 분위기를 직접 느끼는 체험 희망" },
      { value: "watch", label: "조금 더 살펴볼 의향" },
      { value: "unchanged", label: "아직 큰 변화 없는 상태" },
      { value: "not_watched", label: "영상을 보지 못한 상태" }
    ]
  },

  keepsakes: {
    id: "keepsakes",
    type: "checkbox",
    required: false,
    title: "기억하고 싶은 물건 선택",
    hint: "복수 선택 가능, 미선택 시 다음 문항으로 이동 가능함.",
    options: [
      { value: "keyring", label: "키링" },
      { value: "postcard", label: "엽서" },
      { value: "sticker", label: "스티커" },
      { value: "tattoo", label: "타투 스티커" }
    ]
  },

  maero: {
    id: "maero",
    type: "radio",
    required: true,
    title: "가장 마음에 드는 마에로 선택",
    options: [
      { value: "basic", label: "처음의 마에로" },
      { value: "blue", label: "물을 지난 마에로" },
      { value: "red", label: "불을 지난 마에로" }
    ]
  },

  after: {
    id: "after",
    type: "scale",
    required: true,
    title: "장면 시청 후 방문 의향",
    hint: "이 페이지에서 만난 장면을 떠올리며 해당 숫자 선택",
    low: "별로 가고 싶지 않은 마음",
    high: "꼭 가 보고 싶은 마음"
  },

  companion: {
    id: "companion",
    type: "radio",
    required: true,
    title: "동행 희망 대상 선택",
    options: [
      { value: "alone", label: "혼자 방문" },
      { value: "friends", label: "친구와 방문" },
      { value: "family", label: "가족과 방문" },
      { value: "partner", label: "연인과 방문" },
      { value: "unsure", label: "아직 확실하지 않은 상태" }
    ]
  }
};

export function initialAnswers() {
  return {
    awareness: "",
    before: null,
    water: "",
    fire: "",
    keepsakes: [],
    maero: "",
    after: null,
    companion: "",
    email: "",
    emailConsent: false
  };
}

export function validateAnswers(
  answers,
  { allowEmail = true } = {}
) {
  const errors = {};

  for (const question of Object.values(questions)) {
    const value = answers[question.id];

    if (question.type === "scale") {
      if (!Number.isInteger(value) || value < 1 || value > 5) {
        errors[question.id] = "1부터 5까지 숫자 하나 선택 필요";
      }

      continue;
    }

    const validValues = question.options.map(
      (option) => option.value
    );

    if (question.type === "checkbox") {
      if (
        !Array.isArray(value) ||
        value.some((item) => !validValues.includes(item)) ||
        new Set(value).size !== value.length
      ) {
        errors[question.id] = "선택 항목 재확인 필요";
      }

      continue;
    }

    if (!validValues.includes(value)) {
      errors[question.id] = "항목 하나 선택 필요함.";
    }
  }

  const email = String(answers.email || "").trim();

  if (email) {
    if (!allowEmail) {
      errors.email = "현재 이메일 수신 준비 중임.";
    } else if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      errors.email = "이메일 주소 형식 확인 요청";
    }

    if (answers.emailConsent !== true) {
      errors.emailConsent = "이메일을 남길 경우 동의 필요함.";
    }
  }

  return errors;
}

export function answerLabel(id, value) {
  const question = questions[id];

  if (!question) return String(value ?? "");

  if (question.type === "scale") {
    return value == null ? "" : String(value);
  }

  const findLabel = (item) =>
    question.options.find((option) => option.value === item)
      ?.label || String(item);

  return Array.isArray(value)
    ? value.map(findLabel).join(", ")
    : findLabel(value);
}