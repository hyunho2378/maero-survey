import { useState } from "react";
import { places } from "./content.js";
import { ArrowIcon, Img, SectionHead } from "./ui.jsx";

/*
 * 장소 지도: 왼쪽은 장소 목록(번호와 이름), 오른쪽은 고른 장소의 장면.
 * 목록 항목에 마우스를 올리거나 누르면 오른쪽 장면이 opacity로 바뀜.
 * 좁은 폭에서는 장소마다 장면과 설명을 세로로 쌓음.
 */
export default function PxPlaces() {
  const [active, setActive] = useState(0);

  return (
    <section id="places" className="px-section px-places" aria-labelledby="px-places-title" data-track-section="festival-places">
      <SectionHead id="px-places-title" label={places.label} title={places.title} />

      <div className="px-place-layout">
        <ol className="px-place-list" role="list">
          {places.items.map((item, index) => (
            <li key={item.id} className="px-reveal">
              <button
                type="button"
                className={`px-place ${index === active ? "is-active" : ""}`}
                aria-pressed={index === active}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={() => setActive(index)}
              >
                <span className="px-place-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="px-place-copy">
                  <span className="px-place-name">{item.name}</span>
                  <span className="px-place-text">{item.text}</span>
                </span>
              </button>
              <a
                className="px-place-map"
                href={`https://map.naver.com/p/search/${encodeURIComponent(`춘천 ${item.name.replace(/^춘천 /, "")}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${item.name} 지도 보기, 새 창`}
              >
                지도 보기
                <ArrowIcon />
              </a>
              <figure className="px-place-inline">
                <Img file={item.image} alt={item.alt} width={700} height={1254} />
              </figure>
            </li>
          ))}
        </ol>

        <div className="px-place-stage">
          {places.items.map((item, index) => (
            <figure
              key={item.id}
              className={`px-place-shot ${index === active ? "is-active" : ""}`}
              aria-hidden={index === active ? undefined : "true"}
            >
              <Img file={item.image} alt={index === active ? item.alt : ""} width={700} height={1254} />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
