import { Artwork } from "./CollectCard.jsx";

/* 웹툰풍 네 칸: 그림은 한 장, 칸별 설명은 번호 목록으로 둠. */
const panels = [
  { id: "stop", text: "정류장에서 삐삐로가 마에로의 소매를 당기는 장면" },
  { id: "stream", text: "시냇가 길을 둘이 함께 걷는 장면임." },
  { id: "wall", text: "보이지 않는 벽을 두 손으로 미는 마에로" },
  { id: "sunset", text: "해 질 녘 먼 무대를 바라보는 두 친구임." }
];

export default function Webtoon() {
  return (
    <div
      id="webtoon"
      className="webtoon-section more-group"
      data-track-section="festival-webtoon"
    >
      <p className="eyebrow text-blue">웹툰풍 네 칸</p>

      <h3 id="webtoon-title">마에로와 삐삐로의 축제 길</h3>

      <div className="webtoon-layout">
        <div className="webtoon-media">
          <Artwork
            className="webtoon-photo"
            file="img/artwork_webtoon_festival_road.jpg"
            alt="마에로와 삐삐로가 정류장에서 시냇가 길과 보이지 않는 벽을 지나 해 질 녘 먼 무대를 바라보는 네 칸 그림"
            width={1600}
            height={1600}
          />
        </div>

        <div className="webtoon-panel">
          <h4 id="webtoon-steps-title">칸별 내용</h4>

          <ol
            className="webtoon-steps"
            role="list"
            aria-labelledby="webtoon-steps-title"
          >
            {panels.map((panel) => (
              <li key={panel.id}>
                <p>{panel.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
