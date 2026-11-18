export const questions = {
  gender: {
    id: "gender",
    type: "radio",
    required: true,
    title: "성별을 알려 주세요.",
    options: [
      { value: "female", label: "여성" },
      { value: "male", label: "남성" }
    ]
  },

  age: {
    id: "age",
    type: "radio",
    required: true,
    title: "연령대를 알려 주세요.",
    options: [
      { value: "teen", label: "10대" },
      { value: "20s", label: "20대" },
      { value: "30s", label: "30대" },
      { value: "40s", label: "40대" },
      { value: "50s", label: "50대" },
      { value: "60s", label: "60대 이상" }
    ]
  },

  region: {
    id: "region",
    type: "radio",
    required: true,
    title: "현재 거주하시는 지역은 어디인가요?",
    options: [
      { value: "chuncheon", label: "춘천" },
      { value: "gangwon", label: "강원도 내 춘천 외 지역" },
      { value: "capital", label: "서울, 경기, 인천" },
      { value: "other", label: "그 외 지역" }
    ]
  },

  awareness: {
    id: "awareness",
    type: "radio",
    required: true,
    title: "춘천마임축제에 대해 들어 보셨나요?",
    options: [
      { value: "never", label: "처음 들어봐요" },
      { value: "name", label: "이름은 들어봤어요" },
      { value: "know", label: "어떤 축제인지 알아요" }
    ]
  },

  souvenir: {
    id: "souvenir",
    type: "radio",
    required: true,
    title: "최근 2년 안에 지역 축제나 관광지에서 기념품을 구매해 보신 적이 있으신가요?",
    options: [
      { value: "yes", label: "네, 구매해 본 적이 있어요" },
      { value: "no", label: "아니요, 구매해 본 적이 없어요" }
    ]
  },

  before: {
    id: "before",
    type: "scale",
    required: true,
    title: "춘천마임축제에서 캐릭터 기념품을 판다면 구매하고 싶으신가요?",
    low: "사고 싶지 않아요",
    high: "꼭 사고 싶어요"
  },

  water: {
    id: "water",
    type: "radio",
    required: true,
    title: "개막난장 영상에서 어떤 점이 가장 마음에 드셨나요?",
    options: [
      { value: "join", label: "함께 뛰어놀고 싶은 분위기" },
      { value: "watch", label: "보기만 해도 시원한 장면" },
      { value: "maero", label: "블루 마에로가 잘 어울리는 장면" }
    ]
  },

  fire: {
    id: "fire",
    type: "radio",
    required: true,
    title: "도깨비난장 영상에서 어떤 점이 가장 마음에 드셨나요?",
    options: [
      { value: "join", label: "그 열기를 직접 느껴 보고 싶어요" },
      { value: "watch", label: "밤을 밝히는 장면이 멋져요" },
      { value: "maero", label: "레드 마에로가 잘 어울리는 장면" }
    ]
  },

  fit: {
    id: "fit",
    type: "scale",
    required: true,
    title: "영상 속 장면과 마에로와 삐삐로 그림이 잘 어울린다고 느끼셨나요?",
    low: "어울리지 않아요",
    high: "매우 잘 어울려요"
  },

  keepsakes: {
    id: "keepsakes",
    type: "checkbox",
    required: false,
    title: "위 그림으로 만든다면 갖고 싶은 기념품을 모두 골라 주세요.",
    hint: "여러 개를 골라도 되고, 마음에 드는 게 없으면 건너뛰어도 돼요.",
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
    title: "가장 마음에 드는 마에로를 골라 주세요.",
    options: [
      { value: "basic", label: "기본 마에로" },
      { value: "blue", label: "블루 마에로" },
      { value: "red", label: "레드 마에로" }
    ]
  },

  price: {
    id: "price",
    type: "radio",
    required: true,
    title: "마에로 키링을 구매한다면 얼마까지 가능하신가요?",
    options: [
      { value: "p5900", label: "5,900원까지" },
      { value: "p6900", label: "6,900원까지" },
      { value: "p7900", label: "7,900원까지" },
      { value: "p8900", label: "8,900원까지" },
      { value: "p9900", label: "9,900원 이상도 괜찮아요" }
    ]
  },
  comment: {
    id: "comment",
    type: "text",
    required: false,
    title: "마에로와 삐삐로, 기념품에 바라는 점이 있다면 자유롭게 적어 주세요.",
    maxLength: 500
  }
};

export function initialAnswers() {
  return {
    gender: "",
    age: "",
    region: "",
    awareness: "",
    souvenir: "",
    before: null,
    water: "",
    fire: "",
    keepsakes: [],
    maero: "",
    fit: null,
    price: "",
    comment: "",
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

    if (question.type === "text") {
      if (typeof value !== "string" || value.length > (question.maxLength || 500)) {
        errors[question.id] = "500자 안으로 적어 주세요.";
      }

      continue;
    }

    if (question.type === "scale") {
      if (!Number.isInteger(value) || value < 1 || value > 5) {
        errors[question.id] = "1부터 5까지 숫자 하나를 골라 주세요.";
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
        errors[question.id] = "선택한 항목을 다시 확인해 주세요.";
      }

      continue;
    }

    if (!validValues.includes(value)) {
      errors[question.id] = "하나를 골라 주세요.";
    }
  }

  const email = String(answers.email || "").trim();

  if (email) {
    if (!allowEmail) {
      errors.email = "지금은 이메일을 받지 않아요.";
    } else if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      errors.email = "이메일 주소를 다시 확인해 주세요.";
    }

    if (answers.emailConsent !== true) {
      errors.emailConsent = "이메일을 남기려면 동의가 필요해요.";
    }
  }

  return errors;
}

export function answerLabel(id, value) {
  const question = questions[id];

  if (!question) return String(value ?? "");

  if (question.type === "scale" || question.type === "text") {
    return value == null ? "" : String(value);
  }

  const findLabel = (item) =>
    question.options.find((option) => option.value === item)
      ?.label || String(item);

  return Array.isArray(value)
    ? value.map(findLabel).join(", ")
    : findLabel(value);
}