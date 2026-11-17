/*
 * v36 화면 문구. 질의 204 답변(GPT-6 Astra) 원고를 바탕으로 골라 쓰고
 * 일부 문장은 직접 다듬음(P_작업로그 참고).
 * |는 줄바꿈 후보 경계이며 화면에서는 줄바꿈 단위로 씀.
 */
import { sources } from "../data/festival.js";

export const nav = [
  { href: "#festival", label: "축제 소개" },
  { href: "#programs", label: "대표 프로그램" },
  { href: "#places", label: "개최 장소" },
  { href: "#characters", label: "마에로와 삐삐로" },
  { href: "#survey", label: "관심 설문" }
];

export const hero = {
  brand: "춘천마임축제",
  center: "몸풍경 2026",
  outline: "마임축제",
  solid: "몸풍경",
  intro: "말없이 몸짓으로 전하는 이야기|춘천의 몸풍경",
  period: "2026년 5월 24일부터 5월 31일까지",
  start: "설문 시작",
  more: "축제 소개",
  cards: [
    { file: "img/v36/hero_wall.jpg", wipe: "ink" },
    { file: "img/v36/hero_blue.jpg", wipe: "blue" },
    { file: "img/v36/hero_gloves.jpg", wipe: "ink" },
    { file: "img/v36/hero_parade.jpg", wipe: "ink" },
    { file: "img/v36/hero_red.jpg", wipe: "red" },
    { file: "img/v36/hero_pipiro.jpg", wipe: "ink" },
    { file: "img/v36/hero_puddle.jpg", wipe: "blue" }
  ]
};

export const festivalIntro = {
  label: "축제 소개",
  title: "몸짓에서|시작한 축제",
  image: "img/v36/festival_lake.jpg",
  imageAlt: "안개 낀 호수 위 다리를 건너는 마에로",
  rows: [
    {
      title: "몸짓의 이야기",
      body: ["말 없이 몸짓으로 이야기하는 공연예술임.", "움직임과 표정에 담긴 마음 관찰"]
    },
    {
      title: "축제의 시작",
      body: ["1989년 첫 축제 개최", "그때부터 이어진 몸짓의 이야기"]
    },
    {
      title: "몸풍경",
      body: [
        "몸은 세상과 만나는 소통의 출발점임.",
        "몸이 움직이는 시간과 공간의 관계 탐색",
        "그 사이에 더해지는 사람 사이의 관계"
      ]
    },
    {
      title: "2026년의 만남",
      body: ["2026년 5월 24일부터 5월 31일까지", "몸풍경을 주제로 춘천 곳곳에서 개최함."]
    }
  ],
  facts: [
    { value: "1989", label: "첫 축제 개최" },
    { value: "8일", label: "2026년 개최 기간" },
    { value: "5곳", label: "2026년 개최 장소" }
  ],
  source: sources.festival
};

export const programs = {
  label: "대표 프로그램",
  title: "춘천의|대표 프로그램",
  items: [
    {
      id: "water",
      number: "01",
      name: "개막난장 아!水라장",
      place: "춘천 중앙로",
      summary: "도시에서 시작하는 물의 장면",
      image: "img/v36/program_water.jpg",
      hover: "img/v36/program_water_hover.jpg",
      large: "img/v36/program_water_detail.jpg",
      detail: ["2026년 대표 프로그램 가운데 하나임.", "물의 장면 영상으로 느껴지는 분위기 감상"],
      link: { href: "#water-video", label: "물의 장면 영상으로 이동" },
      alt: "물줄기가 솟는 도심 거리 위 파란 마에로",
      tone: "blue"
    },
    {
      id: "walk",
      number: "02",
      name: "걷다보는마임",
      place: "석사천 산책로, 우두공원",
      summary: "산책길에서 만나는 몸짓",
      image: "img/v36/program_walk.jpg",
      hover: "img/v36/program_walk_hover.jpg",
      large: "img/v36/program_walk_detail.jpg",
      detail: ["2026년 만남의 장소는 석사천 산책로와 우두공원임.", "걷는 길에 공연이 있을 때의 기분 상상"],
      link: { href: "#places", label: "개최 장소로 이동" },
      alt: "버드나무 산책로를 걷는 마에로",
      tone: "yellow"
    },
    {
      id: "art",
      number: "03",
      name: "예술난장 X",
      place: "레고랜드 코리아 리조트 주차장",
      summary: "흰 조형물 사이에서 만나는 장면",
      image: "img/v36/program_art.jpg",
      hover: "img/v36/program_art_hover.jpg",
      large: "img/v36/program_art_detail.jpg",
      detail: ["2026년 대표 프로그램 가운데 하나임.", "이름과 장소를 확인한 뒤 떠올리는 축제의 장면"],
      link: { href: "#survey", label: "관심 설문으로 이동" },
      alt: "흰 조형물이 놓인 야외 마당의 마에로와 삐삐로",
      tone: "yellow"
    },
    {
      id: "night",
      number: "04",
      name: "밤샘난장 도깨비난장",
      place: "레고랜드 코리아 리조트 주차장",
      summary: "불과 밤의 장면",
      image: "img/v36/program_night.jpg",
      hover: "img/v36/program_night_hover.jpg",
      large: "img/v36/program_night_detail.jpg",
      detail: ["2026년에 이곳에서 도깨비난장을 개최함.", "불과 밤의 분위기를 살펴보는 영상 감상"],
      link: { href: "#fire-video", label: "불과 밤의 장면 영상으로 이동" },
      alt: "불길 앞에 선 빨간 마에로",
      tone: "red"
    }
  ],
  source: sources.programs
};

export const places = {
  label: "개최 장소",
  title: "춘천의|개최 장소",
  items: [
    {
      id: "central",
      name: "춘천 중앙로",
      text: "개막난장 아!水라장의 개최 장소",
      image: "img/v36/place_central.jpg",
      alt: "도심 거리를 따라 이어진 몸짓 행렬"
    },
    {
      id: "theater",
      name: "축제극장몸짓",
      text: "2026년 춘천마임축제 개최 장소임.",
      image: "img/v36/place_theater.jpg",
      alt: "조명 아래 무대에 선 마에로"
    },
    {
      id: "commons",
      name: "커먼즈필드 춘천",
      text: "춘천마임축제가 열린 공간",
      image: "img/v36/place_commons.jpg",
      alt: "잔디 마당 벤치 위 삐삐로"
    },
    {
      id: "stream",
      name: "석사천 산책로",
      text: "2026년 걷다보는마임의 개최 장소임.",
      image: "img/v36/place_stream.jpg",
      alt: "밤의 개울 위 불 밝힌 다리"
    },
    {
      id: "resort",
      name: "레고랜드 코리아 리조트 주차장",
      text: "예술난장 X와 밤샘난장 도깨비난장 개최 장소",
      image: "img/v36/place_resort.jpg",
      alt: "호숫가 넓은 주차장을 내려다본 장면"
    }
  ]
};

export const characterIntro = {
  label: "길잡이",
  title: "마에로와 삐삐로",
  image: "img/v36/characters_group.jpg",
  imageAlt: "흰 바탕 위에 나란히 선 마에로 셋과 삐삐로",
  items: [
    {
      name: "처음의 마에로",
      text: "낯선 몸짓 앞에서 잠깐 멈춰 선 자세",
      image: "img/3d_maero_basic.png"
    },
    {
      name: "물을 지난 마에로",
      text: "물의 장면을 지나 모습이 바뀐 마에로",
      image: "img/3d_maero_blue.png"
    },
    {
      name: "불을 지난 마에로",
      text: "구경하던 마음에서 축제 안으로 들어선 모습",
      image: "img/3d_maero_red.png"
    },
    {
      name: "삐삐로",
      text: "말없는 마에로 곁에서 마음을 전함.",
      image: "img/3d_pipiro.png"
    }
  ]
};

export const surveyCopy = {
  label: "관심 설문",
  title: "춘천마임축제 영상 감상과|기념품 설문조사",
  intro: "영상 두 편을 보고 문항 8개에 답하는 설문이에요.|이름과 전화번호는 받지 않아요.",
  required: "기억에 남기고 싶은 물건 문항 외에는 모두 답해야 제출할 수 있어요.",
  image: "img/orig/maero_basic.png",
  stages: {
    basic: { name: "기본 정보", guide: "통계를 내기 위해 간단히 여쭙겠습니다." },
    festival: { name: "춘천마임축제와 기념품", guide: "축제와 기념품에 대한 경험과 생각을 여쭙겠습니다." },
    videos: { name: "영상 감상", guide: "영상 두 편을 차례로 보시고 아래 문항에 답해 주세요. 본 만큼만 답해 주셔도 됩니다." },
    maero: { name: "마에로와 삐삐로", guide: "영상 속 장면과 함께 그려진 캐릭터입니다." },
    goods: { name: "기념품과 가격", guide: "위 그림으로 기념품을 만든다면 어떤지 여쭙겠습니다." },
    last: { name: "마지막으로", guide: "" }
  },

  keepsakes: [
    { file: "img/orig/maero_basic.png", title: "기본 마에로 키링", alt: "기본 마에로와 삐삐로 일러스트", group: "keyring" },
    { file: "img/orig/maero_blue.png", title: "블루 마에로 키링", alt: "블루 마에로와 삐삐로 일러스트", group: "keyring" },
    { file: "img/orig/maero_red.png", title: "레드 마에로 키링", alt: "레드 마에로와 삐삐로 일러스트", group: "keyring" },
    { file: "img/orig/maero_v2.png", title: "꽃을 든 마에로 키링", alt: "꽃을 들고 앉은 마에로와 삐삐로 일러스트", group: "keyring" },
    { file: "img/orig/maero_v3.png", title: "붓과 팔레트 마에로 키링", alt: "붓과 팔레트를 든 마에로와 삐삐로 일러스트", group: "keyring" },
    { file: "img/orig/postcard_arrive.jpg", title: "엽서 도착", alt: "붉은 꽃 사이의 마에로와 삐삐로 엽서", group: "postcard" },
    { file: "img/orig/postcard_water.jpg", title: "엽서 물", alt: "물총을 든 블루 마에로와 삐삐로 엽서", group: "postcard" },
    { file: "img/orig/postcard_fire.jpg", title: "엽서 불", alt: "턱을 괸 레드 마에로와 삐삐로 엽서", group: "postcard" },
    { file: "img/orig/postcard_farewell.jpg", title: "엽서 배웅", alt: "붓을 든 마에로와 삐삐로 엽서", group: "postcard" }
  ],
  mockups: [
    { file: "img/mock/mock_keyring.jpg", alt: "마에로와 삐삐로 아크릴 키링 다섯 종 목업" },
    { file: "img/mock/mock_postcard.jpg", alt: "마에로와 삐삐로 엽서 네 장 목업" },
    { file: "img/mock/mock_sticker.jpg", alt: "마에로와 삐삐로 원형 스티커 목업" },
    { file: "img/mock/mock_tattoo.jpg", alt: "마에로와 삐삐로 타투 스티커 목업" }
  ],
  submitRemote: "제출",
  submitLocal: "제출"
};

export const resultCopy = {
  remote: "응답이 제출됐어요",
  local: "이 기기에 저장했어요",
  description: "춘천마임축제에 대한 마음을 남겨 주셔서 고마워요.",
  image: "img/orig/maero_basic.png",
  lines: {
    basic: "내가 고른 기본 마에로",
    blue: "내가 고른 블루 마에로",
    red: "내가 고른 레드 마에로"
  }
};

export const footerCopy = {
  wordmark: "춘천마임축제",
  links: [
    { href: sources.festival, label: "축제 소개" },
    { href: sources.programs, label: "프로그램 안내" },
    { href: sources.history, label: "축제의 발자취" },
    { href: sources.official, label: "춘천마임축제 누리집" }
  ],
  date: "정보 기준일 2026년 11월 2일"
};

export function lines(text) {
  return String(text).split("|");
}
