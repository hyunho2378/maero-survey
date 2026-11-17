const palette = Object.freeze({
  /* 관리 화면 전용. 2026. 11. 10. 대표 정정으로 순수 블루와 순수 레드 폐기 */
  blue: "#3172D8",
  red: "#F4C418",
  ink: "#0A0A0A",
  secondary: "#333333",
  white: "#FFFFFF",
  shadow: "rgba(10, 10, 10, 0.10)"
});

export const tokens = Object.freeze({
  "--blue": palette.blue,
  "--red": palette.red,
  "--ink": palette.ink,
  "--night": palette.ink,
  "--white": palette.white,

  "--text-primary": palette.ink,
  "--text-secondary": palette.secondary,
  "--surface-page": palette.white,
  "--surface-card": palette.white,
  "--surface-soft": palette.white,

  "--action-primary": palette.red,
  "--on-action-primary": palette.ink,
  "--action-secondary": palette.blue,
  "--on-action-secondary": palette.white,
  "--selected": palette.blue,
  "--on-selected": palette.white,
  "--focus-color": palette.blue,
  "--status-error": palette.ink,

  "--font-body":
    '"Pretendard", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  "--font-display":
    '"Gaegu", "Pretendard", system-ui, sans-serif',

  "--weight-regular": "400",
  "--weight-medium": "500",
  "--weight-selected": "600",

  "--font-title":
    "clamp(2.5rem, calc(2rem + 0.56vw), 3.5rem)",
  "--font-heading":
    "clamp(1.75rem, calc(1.5rem + 0.5vw), 2.25rem)",
  "--font-question":
    "clamp(1.25rem, calc(1.1rem + 0.167vw), 1.5rem)",
  "--font-body-size":
    "clamp(1rem, calc(0.875rem + 0.14vw), 1.25rem)",
  "--font-helper":
    "clamp(0.8125rem, calc(0.75rem + 0.07vw), 1rem)",
  "--font-number":
    "clamp(2.5rem, calc(2rem + 1vw), 4rem)",

  "--leading-title": "1.18",
  "--leading-heading": "1.3",
  "--leading-body": "1.75",
  "--leading-ui": "1.5",
  "--leading-compact": "1.25",

  "--tracking-title": "-0.025em",
  "--tracking-body": "0",
  "--tracking-small": "0.015em",

  "--space-1": "0.25rem",
  "--space-2": "0.5rem",
  "--space-3": "0.75rem",
  "--space-4": "1rem",
  "--space-5": "1.5rem",
  "--space-6": "2rem",
  "--space-7": "3rem",
  "--space-8": "4rem",
  "--space-9": "6rem",

  "--page-gutter": "clamp(0.75rem, 2.4vw, 3rem)",
  "--card-padding-inline":
    "clamp(1rem, calc(0.6rem + 1.8vw), 2.5rem)",
  "--card-padding-block":
    "clamp(1.5rem, calc(1rem + 1.2vw), 2.5rem)",
  "--space-section": "clamp(3.5rem, 7vw, 8rem)",

  "--radius": "1.5rem",
  "--radius-card": "1.5rem",
  "--radius-control": "999px",
  "--shadow-color": palette.shadow,
  "--shadow": "0 8px 24px var(--shadow-color)",

  "--content-max": "clamp(70rem, 78vw, 112rem)",
  "--survey-max":
    "clamp(40rem, calc(31rem + 10vw), 55rem)",
  "--reading-max": "44rem",
  "--heading-measure": "20ch",
  "--hero-title-measure": "18ch",

  "--hero-art-size": "clamp(14rem, 26vw, 23rem)",
  "--world-art-size": "clamp(8rem, 12vw, 12rem)",
  "--story-art-size": "clamp(14rem, 22vw, 24rem)",
  "--gallery-min": "clamp(14rem, 28vw, 25rem)",
  "--video-min": "12.5rem",
  "--status-card-min": "8rem",
  "--image-perspective": "900px",

  "--control-min": "2.75rem",
  "--choice-min": "3.5rem",
  "--scale-min": "4.5rem",
  "--submit-min": "3.75rem",
  "--control-indicator": "1.25rem",
  "--control-dot": "0.5rem",

  "--sticker-sm": "1rem",
  "--sticker-md": "2rem",
  "--sticker-lg": "4rem",

  "--tilt-none": "0deg",
  "--tilt-left": "-8deg",
  "--tilt-right": "8deg",

  "--duration-fast": "200ms",
  "--duration-medium": "400ms",
  "--ease-out": "cubic-bezier(0.2, 0.8, 0.2, 1)",
  "--press-scale": "0.97",
  "--hover-lift": "-0.25rem",
  "--shake-distance": "0.25rem",

  "--focus-width": "0.1875rem",
  "--focus-offset": "0.25rem",
  "--hairline": "1px",

  "--wave-height": "clamp(1.5rem, 4vw, 4rem)",
  "--anchor-offset": "12rem",

  "--table-cell-min": "7rem",
  "--table-key-min": "12rem",

  "--layer-header": "30",
  "--layer-skip": "100"
});

/*
 * 표시 문구의 |는 절 경계이다.
 * Phrase 컴포넌트가 경계마다 공백을 넣어 원래 문장을 보존한다.
 * 설문 데이터와 저장 payload에는 사용하지 않는다.
 */
export const uiCopy = Object.freeze({
  heroTitle:
    "말은 잠깐 쉬고|만나는 축제",
  heroDescription:
    "마에로와 삐삐로를 따라|장면 관람 후 마음 기록",
  heroDisclaimer:
    "한림대 학생팀 제작 설문임.|축제 공식 페이지는 아님.",
  scrollCue:
    "아래로 이어지는 이야기",

  worldTitle:
    "처음 온 마음도 환영",
  worldDescription:
    "마에로는 축제에 처음 온 관객을 닮은|말 없는 마임맨임.|노란 병아리 삐삐로는|마에로 대신 말을 전함.|마에로가 물과 불을 지나며|모습이 바뀌는 순서는|낯설던 관객이 축제에|조금씩 녹아드는 순서와 같음.",
  worldClosing:
    "오늘의 주인공은 춘천마임축제임.|두 친구는 그곳으로 가는 길을 안내함.",

  entryStoryTitle:
    "마에로의 모습 변화",
  entryFestivalTitle:
    "춘천의 몸짓 만남",
  entrySurveyTitle:
    "내 마음이 움직이는 방향",

  surveyTitle:
    "축제와 가까워진 정도",
  surveyDescription:
    "정답 없음.|지금 느끼는 마음을|그대로 선택",

  beforeDescription:
    "이 문항을 만난|지금의 마음부터 기록",
  videoDescription:
    "영상을 본 뒤|바로 아래에서 마음 선택",
  fireDescription:
    "다른 장면에서는|어떤 마음이 드는지 확인",
  keepsakeDescription:
    "물건과 길잡이 모습 선택",
  afterDescription:
    "장면을 만나기 전과|같아도 무방함.",

  newsletterDescription:
    "팀이 전하는 축제 관련 소식을|원할 때만 이메일 입력",
  submitHelper:
    "제출 시 답변과|이 페이지의 탐색 기록을|함께 저장함.",

  footerDescription:
    "한림대 학생 창업팀 버터와플이|마에로와 삐삐로를 통해|축제를 만나는 경험을 살펴봄."
});

export function applyTokens(element = document.documentElement) {
  for (const [name, value] of Object.entries(tokens)) {
    element.style.setProperty(name, value);
  }
}

/*
 * v36 공개 화면 토큰 (2026. 11. 10.)
 * 질의 202 답변의 색, 글자 단계, 격자, 모션, 그림자 값을 골라 쓰고
 * 나머지는 직접 작성함. 공개 화면은 --px- 토큰만 씀.
 * 색: 무채색, 순수 블루, 순수 레드만.
 */
const pxPalette = Object.freeze({
  /* 2026. 11. 10. 16:50 대표 정정: 브랜드기획서 6-5 팔레트. 순수 블루와 순수 레드 폐기 */
  yellow: "#F4C418",
  yellowSoft: "#FFFB9C",
  ink: "#261615",
  paper: "#F9F9F9",
  water: "#3172D8",
  fire: "#FF7373",
  white: "#FFFFFF",
  surface2: "#F0F0F0",
  text2: "#555555",
  text3: "#6B6B6B",
  onDark2: "#D4D4D4",
  clear: "transparent",
  shade1: "rgba(38, 22, 21, 0.12)",
  shade2: "rgba(38, 22, 21, 0.18)",
  shade3: "rgba(38, 22, 21, 0.28)",
  veil: "rgba(38, 22, 21, 0.62)",
  veilStrong: "rgba(38, 22, 21, 0.88)"
});

export const pxTokens = Object.freeze({
  "--px-yellow": pxPalette.yellow,
  "--px-yellow-soft": pxPalette.yellowSoft,
  "--px-water": pxPalette.water,
  "--px-fire": pxPalette.fire,
  "--px-bg": pxPalette.paper,
  "--px-surface": pxPalette.white,
  "--px-surface-2": pxPalette.surface2,
  "--px-text": pxPalette.ink,
  "--px-text-2": pxPalette.text2,
  "--px-text-3": pxPalette.text3,
  "--px-dark": pxPalette.ink,
  "--px-on-dark": pxPalette.paper,
  "--px-on-dark-2": pxPalette.onDark2,
  "--px-on-accent": pxPalette.ink,
  "--px-clear": pxPalette.clear,
  "--px-veil": pxPalette.veil,
  "--px-veil-strong": pxPalette.veilStrong,

  "--px-font":
    '"Pretendard", "Noto Sans KR", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  "--px-w-regular": "400",
  "--px-w-medium": "500",
  "--px-w-semibold": "600",

  /* 플러스엑스 분류 글자 200px 700을 600으로 낮춘 대형 제목 */
  "--px-mega-size": "clamp(4.25rem, 15vw, 30rem)",
  "--px-mega-leading": "0.92",
  "--px-mega-tracking": "-0.05em",
  "--px-stroke": "clamp(1px, 0.14vw, 5px)",

  /* 상세 title-xl 119.8px 500 -0.04em = 1440 폭의 8.32vw */
  "--px-display-size": "clamp(2.375rem, 8.32vw, 20rem)",
  "--px-display-leading": "1.02",
  "--px-display-tracking": "-0.045em",

  /* 상세 title-l 59.9px 600 -0.03em = 4.16vw */
  "--px-heading-size": "clamp(1.75rem, 4.16vw, 10rem)",
  "--px-heading-leading": "1.12",
  "--px-heading-tracking": "-0.03em",

  /* 상세 .title 33.7px 500 -0.02em = 2.34vw */
  "--px-title-size": "clamp(1.375rem, 2.34vw, 5.6rem)",
  "--px-title-leading": "1.36",
  "--px-title-tracking": "-0.02em",

  "--px-lead-size": "clamp(1.125rem, 1.56vw, 3.75rem)",
  "--px-lead-leading": "1.6",

  /* 본문 행간 1.7~2.0, 자간 -0.02em */
  "--px-body-size": "clamp(1rem, 1.11vw, 2.67rem)",
  "--px-body-leading": "1.8",
  "--px-body-tracking": "-0.02em",

  "--px-small-size": "clamp(0.875rem, 0.97vw, 2.33rem)",
  "--px-small-leading": "1.6",

  "--px-gutter": "clamp(1.25rem, 3.472vw, 8.333rem)",
  "--px-section": "clamp(5rem, 11vw, 26rem)",
  "--px-gap": "clamp(0.625rem, 0.694vw, 1.666rem)",
  "--px-gap-2": "clamp(1.25rem, 2.08vw, 5rem)",
  "--px-card-ratio": "200 / 323",
  "--px-read": "46em",
  "--px-form": "max(46rem, 52vw)",

  "--px-radius": "4px",

  "--px-shadow-0": "none",
  "--px-shadow-1": `0 2px 8px ${pxPalette.shade1}`,
  "--px-shadow-2": `0 12px 32px ${pxPalette.shade2}`,
  "--px-shadow-3": `0 28px 72px ${pxPalette.shade3}`,

  "--px-ease-card": "cubic-bezier(0.215, 0.61, 0.355, 1)",
  "--px-ease-reveal": "cubic-bezier(0.45, 0, 0.55, 1)",
  "--px-ease-slow": "cubic-bezier(0.19, 1, 0.22, 1)",
  "--px-t-fade": "200ms",
  "--px-t-card": "250ms",
  "--px-t-wipe": "360ms",
  "--px-t-wipe-delay": "50ms",
  "--px-t-reveal": "600ms",
  "--px-t-slow": "1100ms",
  "--px-rise": "2.5rem",
  "--px-lift": "-0.375rem",
  "--px-press": "0.97",

  "--px-control": "2.75rem",
  "--px-choice": "3.5rem",
  "--px-focus": "3px",
  "--px-header-h": "clamp(4rem, 6.4vw, 12rem)",
  "--px-layer-header": "40",
  "--px-layer-menu": "60",
  "--px-layer-skip": "100"
});

export function applyPxTokens(element = document.documentElement) {
  for (const [name, value] of Object.entries(pxTokens)) {
    element.style.setProperty(name, value);
  }
}
