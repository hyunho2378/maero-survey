import { Artwork } from "./CollectCard.jsx";

/* 세계관 컷 3장. ids로 필요한 장면만 골라 씀. */
const scenes = [
  {
    id: "water",
    file: "img/artwork_water_rain.jpg",
    label: "물",
    text: "비 오는 거리에서 마에로가 걷고 삐삐로가 종이배를 띄우는 장면",
    alt: "비 내리는 거리에서 파란 마에로가 걷고 삐삐로가 종이배를 타는 장면"
  },
  {
    id: "fire",
    file: "img/artwork_fire_stage.jpg",
    label: "불",
    text: "밤 무대의 모닥불 곁에서 마에로와 삐삐로가 춤추는 모습임.",
    alt: "밤 무대의 모닥불 곁에서 붉은 마에로와 삐삐로가 춤추는 장면"
  },
  {
    id: "farewell",
    file: "img/artwork_farewell_sunset.jpg",
    label: "배웅",
    text: "노을 진 강변길에서 마에로가 손을 흔들어 배웅함.",
    alt: "노을 진 강변길에서 마에로가 손을 흔드는 장면"
  }
];

export default function Worldview({
  ids = scenes.map((scene) => scene.id)
}) {
  const visible = scenes.filter((scene) => ids.includes(scene.id));

  return (
    <div
      className="worldview-section"
      data-track-section="festival-worldview"
    >
      <ol className="worldview-list" role="list">
        {visible.map((scene) => (
          <li key={scene.id}>
            <article
              className="worldview-card"
              aria-labelledby={`worldview-${scene.id}-title`}
            >
              <div className="worldview-media">
                <Artwork
                  className="worldview-photo"
                  file={scene.file}
                  alt={scene.alt}
                  width={1600}
                  height={1194}
                />
              </div>

              <div className="worldview-panel">
                <h4 id={`worldview-${scene.id}-title`}>{scene.label}</h4>

                <p>{scene.text}</p>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
