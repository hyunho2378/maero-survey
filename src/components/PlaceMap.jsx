import { Artwork } from "./CollectCard.jsx";

/* 장소 연결 지도: 그림은 한 장, 장소별 설명은 번호 목록으로 둡니다. */
const stops = [
  { id: "jungang", place: "춘천 중앙로", program: "개막난장 아!水라장" },
  { id: "theater", place: "축제극장몸짓", program: "극장공연" },
  {
    id: "stream",
    place: "석사천 산책로와 우두공원",
    program: "걷다보는마임"
  },
  {
    id: "parking",
    place: "레고랜드 코리아 리조트 주차장",
    program: "도깨비난장"
  }
];

export default function PlaceMap() {
  return (
    <section
      id="placemap"
      className="placemap-section"
      aria-labelledby="placemap-title"
    >
      <div
        className="section container"
        data-track-section="festival-placemap"
      >
        <div className="placemap-heading">
          <p className="eyebrow placemap-eyebrow">장소 연결 지도</p>

          <h3 id="placemap-title">네 곳을 잇는 걷는 길</h3>

          <p className="placemap-lead">
            네 장소와 대표 프로그램을 잇는 길 안내
          </p>
        </div>

        <div className="placemap-layout">
          <div className="placemap-media">
            <Artwork
              className="placemap-photo"
              file="img/artwork_placemap_walk.jpg"
              alt="마에로와 삐삐로가 뒷모습으로 걷는 3D 미니어처 지도. 길 하나가 네 장소를 이음"
              width={1600}
              height={1194}
            />
          </div>

          <div className="placemap-panel">
            <h4 id="placemap-steps-title">걷는 길 네 곳</h4>

            <ol
              className="placemap-steps"
              role="list"
              aria-labelledby="placemap-steps-title"
            >
              {stops.map((stop) => (
                <li key={stop.id}>
                  <div className="placemap-stop">
                    <p className="placemap-place">{stop.place}</p>
                    <p className="placemap-program">{stop.program}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <a className="placemap-link" href="#survey">
          축제 관심 설문으로 이동
        </a>
      </div>
    </section>
  );
}