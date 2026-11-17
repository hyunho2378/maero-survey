export const sources = Object.freeze({
  festival: "https://mimefestival.com/festival/cimf",
  programs: "https://mimefestival.com/festival/program",
  history: "https://mimefestival.com/introduce/history",
  official: "https://mimefestival.com"
});

export const festival = Object.freeze({
  name: "춘천마임축제",
  checkedAt: "2026년 11월 2일",
  period: "2026년 5월 24일부터 5월 31일까지",
  theme: "몸풍경",
  introduction:
    "마임은 말 없이 몸짓으로 이야기하는 공연예술임. 춘천마임축제는 1989년부터 시작함. 2026년 개최지는 춘천 곳곳",
  places: [
    "춘천 중앙로",
    "축제극장몸짓",
    "커먼즈필드 춘천",
    "석사천 산책로",
    "레고랜드 코리아 리조트 주차장"
  ]
});

export const infoCards = [
  {
    id: "mime",
    title: "몸짓으로 전하는 이야기",
    text:
      "말 없이 몸짓으로 이야기하는 공연예술임. 움직임과 표정에 담긴 마음 관찰",
    source: sources.festival
  },
  {
    id: "dates",
    title: "2026년 개최 일정",
    text:
      "2026년 5월 24일 일요일부터 5월 31일 일요일까지 개최함. 지난 축제를 살펴보는 안내 페이지임.",
    source: sources.festival
  },
  {
    id: "places",
    title: "춘천 개최 장소",
    text:
      "춘천 중앙로와 축제극장몸짓 두 곳에서 개최함. " +
      "커먼즈필드 춘천과 석사천 산책로 두 곳도 개최 장소임. " +
      "레고랜드 코리아 리조트 주차장 등에서도 개최",
    source: sources.festival
  },
  {
    id: "beginning",
    title: "축제의 시작",
    text:
      "1989년에 첫 축제를 개최함. 그때부터 이어진 몸짓의 이야기 만남",
    source: sources.history
  }
];

export const timeline = [
  {
    label: "1989년",
    title: "몸짓 이야기의 시작",
    text: "첫 축제 개최",
    source: sources.history
  },
  {
    label: "2026년 5월",
    title: "춘천 곳곳에서의 만남",
    text:
      "5월 24일부터 5월 31일까지 몸풍경을 주제로 개최함.",
    source: sources.festival
  },
  {
    label: "2026년 11월",
    title: "지난 장면 감상",
    text:
      "축제 정보 확인일은 11월 2일임. 다음 일정은 공식 안내에서 확인 필요함.",
    source: sources.official
  }
];

export const themeCards = [
  {
    word: "몸",
    title: "움직임에서 시작",
    text:
      "몸은 말보다 먼저 세상과 만나는 소통의 출발점임. 눈이 머무는 몸짓 탐색"
  },
  {
    word: "풍",
    title: "주변 풍경과의 만남",
    text:
      "몸이 움직이는 시간과 공간을 함께 고려함. 장소에 따라 같은 몸짓이 다시 보일 가능성"
  },
  {
    word: "경",
    title: "서로의 관계 체감",
    text:
      "몸과 공간 사이의 관계에 사람 사이의 관계가 더해지는 경험임. 장면을 보는 내 마음까지 함께 점검"
  }
];

/*
 * scene은 실제 행사 사진이나 프로그램의 현장 기록이 아닙니다.
 * 제공된 AI 시안 배경을 포스터의 장식 이미지로만 연결합니다.
 */
export const programs = [
  {
    id: "water",
    number: "01",
    name: "개막난장 아!水라장",
    place: "춘천 중앙로",
    prompt: "도시에서 시작하는 장면 연상",
    detail:
      "2026년 대표 프로그램 가운데 하나임. 물의 장면 영상으로 느껴지는 분위기 감상",
    destination: "#water-video",
    linkLabel: "물의 장면으로 이동",
    scene: "scene_water.jpg",
    posterLabel: "개막난장 아!水라장",
    tone: "blue"
  },
  {
    id: "walk",
    number: "02",
    name: "걷다보는마임",
    place: "석사천 산책로, 우두공원",
    prompt: "산책 중 만나는 몸짓 상상",
    detail:
      "2026년에 만날 수 있던 장소는 석사천 산책로와 우두공원임. 걷는 길에 공연이 있을 때의 기분 상상",
    destination: "#festival-photos",
    linkLabel: "사진 자리로 이동",
    scene: "scene_farewell.jpg",
    posterLabel: "걷다보는마임",
    tone: "red"
  },
  {
    id: "art",
    number: "03",
    name: "예술난장 X",
    place: "레고랜드 코리아 리조트 주차장",
    prompt: "직접 만나고 싶은 장면 선택",
    detail:
      "2026년 대표 프로그램 가운데 하나임. 이름과 장소를 확인한 뒤 현장에서 만나고 싶은 장면 구상",
    destination: "#survey",
    linkLabel: "내 마음 기록",
    scene: "scene_farewell.jpg",
    posterLabel: "예술난장 X",
    tone: "yellow"
  },
  {
    id: "night",
    number: "04",
    name: "밤샘난장 도깨비난장",
    place: "레고랜드 코리아 리조트 주차장",
    prompt: "밤의 장면에서 드는 마음 확인",
    detail:
      "2026년에 이곳에서 도깨비난장을 개최함. 아래 영상은 불과 밤의 분위기를 살펴보는 자료임.",
    destination: "#fire-video",
    linkLabel: "불과 밤의 장면으로 이동",
    scene: "scene_fire.jpg",
    posterLabel: "밤샘난장 도깨비난장",
    tone: "blue"
  }
];

/*
 * 실제 사진이 연결되기 전까지 비워 둡니다.
 * AI 시안 배경을 이 배열에 넣지 않습니다.
 */
export const photos = [
  {
    id: "festival-water",
    file: "",
    description: "물의 장면을 담을 사진 자리",
    source: ""
  },
  {
    id: "festival-walk",
    file: "",
    description: "춘천에서 만나는 몸짓을 담을 사진 자리",
    source: ""
  },
  {
    id: "festival-night",
    file: "",
    description: "불과 밤의 장면을 담을 사진 자리",
    source: ""
  }
];

export const videos = [
  {
    key: "water",
    id: "ggng8MTKaH0",
    anchor: "water-video",
    title: "개막난장 아!水라장",
    description:
      "2026 춘천마임축제 개막 행사 영상이에요. 본 만큼만 느낀 대로 답해 주세요.",
    tone: "blue",
    scene: "scene_water.jpg",
    character: "maero_blue"
  },
  {
    key: "fire",
    id: "vWOqk1XbdB4",
    anchor: "fire-video",
    title: "2026 춘천마임축제 기록영상",
    description:
      "축제 현장을 담은 기록영상이에요. 본 만큼만 느낀 대로 답해 주세요.",
    tone: "red",
    scene: "scene_fire.jpg",
    character: "maero_red"
  }
];

/*
 * cardImage는 3:4 소개 카드 사진(public/img)입니다.
 * 카드 사진을 불러오지 못하면 image(3D 캐릭터)로 대체합니다.
 */
export const characters = [
  {
    name: "maero_basic",
    title: "처음의 마에로",
    text:
      "축제에 처음 온 관객을 닮은 모습임. 낯선 몸짓 앞에서 잠깐 멈춰 선 자세",
    scene: "scene_farewell.jpg",
    number: "01",
    tone: "basic",
    image: "img/3d_maero_basic.png",
    fallbackImage: "img/maero_basic.png",
    cardImage: "img/card_basic.jpg",
    cardLine: "낯선 몸짓 앞에서 잠깐 멈춰 선 자세"
  },
  {
    name: "maero_blue",
    title: "물을 지난 마에로",
    text:
      "물의 장면을 지나며 모습이 바뀐 마에로임. 축제 쪽으로 마음이 조금 움직인 상태",
    scene: "scene_water.jpg",
    number: "02",
    tone: "blue",
    image: "img/3d_maero_blue.png",
    fallbackImage: "img/maero_blue.png",
    cardImage: "img/card_blue.jpg",
    cardLine: "축제 쪽으로 마음이 조금 움직인 상태"
  },
  {
    name: "maero_red",
    title: "불을 지난 마에로",
    text:
      "불과 밤의 장면을 만난 모습임. 구경하던 마음의 축제 속 입장",
    scene: "scene_fire.jpg",
    number: "03",
    tone: "red",
    image: "img/3d_maero_red.png",
    fallbackImage: "img/maero_red.png",
    cardImage: "img/card_red.jpg",
    cardLine: "구경하던 마음의 축제 속 입장"
  },
  {
    name: "pipiro",
    title: "삐삐로",
    text: "마에로의 마음을 대신 전함.",
    number: "04",
    tone: "pipiro",
    image: "img/3d_pipiro.png",
    cardImage: "img/card_pipiro.jpg",
    cardLine: "말없는 마에로 곁에서 전하는 마음"
  }
];