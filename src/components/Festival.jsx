import { useEffect, useRef, useState } from "react";

import CollectCard from "./CollectCard.jsx";
import PosterCard from "./PosterCard.jsx";
import Worldview from "./Worldview.jsx";
import Webtoon from "./Webtoon.jsx";
import PlaceMap from "./PlaceMap.jsx";
import Polaroid from "./Polaroid.jsx";
import { SourceLink } from "./HelpCard.jsx";

import {
  festival,
  sources,
  infoCards,
  timeline,
  themeCards,
  programs,
  photos,
  characters
} from "../data/festival.js";

/*
 * 추적 연결이 없어도 사진 이동과 정보 열기는 유지함.
 * 같은 추적 오류는 최초 한 번만 알림.
 */
const reportedTrackingErrors = new Set();

function record(tracker, method, ...args) {
  try {
    if (typeof tracker?.[method] !== "function") {
      throw new Error(`tracker.${method} 연결 없음`);
    }

    tracker[method](...args);
  } catch (error) {
    if (!reportedTrackingErrors.has(method)) {
      reportedTrackingErrors.add(method);

      console.warn(
        `[Festival] ${method} 기록 실패. ` +
          "Festival에 전달하는 tracker와 해당 메서드 확인 필요",
        error
      );
    }
  }
}

function InformationCard({ item, tracker }) {
  return (
    <details
      className="information-card"
      onToggle={(event) => {
        if (event.currentTarget.open) {
          record(tracker, "infoOpened", `fact-${item.id}`);
        }
      }}
    >
      <summary>
        <span>{item.title}</span>
        <span className="details-state" aria-hidden="true" />
      </summary>

      <div className="details-body">
        <p>{item.text}</p>
        <SourceLink href={item.source} />
      </div>
    </details>
  );
}

function PhotoGallery({ tracker }) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [navigationVersion, setNavigationVersion] = useState(0);

  const figureRef = useRef(null);
  const observerWarningRef = useRef(false);

  const photo = photos[index];

  const available = Boolean(
    photo?.file &&
      /^https:\/\//.test(photo.source) &&
      !failed
  );

  useEffect(() => {
    if (!available || !loaded || !figureRef.current) {
      return undefined;
    }

    if (typeof IntersectionObserver === "undefined") {
      if (!observerWarningRef.current) {
        observerWarningRef.current = true;

        console.warn(
          "[PhotoGallery] 화면 노출 확인 불가. 사진 조회 기록 생략. " +
            "지원 브라우저 확인 필요"
        );
      }

      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (
          entry &&
          !document.hidden &&
          entry.isIntersecting &&
          entry.intersectionRatio >= 0.5
        ) {
          record(
            tracker,
            "photoViewed",
            photo.id,
            navigationVersion > 0
          );
        }
      },
      { threshold: [0, 0.5] }
    );

    observer.observe(figureRef.current);

    function onVisible() {
      if (!document.hidden && figureRef.current) {
        observer.unobserve(figureRef.current);
        observer.observe(figureRef.current);
      }
    }

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      observer.disconnect();

      document.removeEventListener(
        "visibilitychange",
        onVisible
      );
    };
  }, [
    available,
    loaded,
    navigationVersion,
    photo?.id,
    tracker
  ]);

  function change(direction) {
    if (photos.length < 2) return;

    setLoaded(false);
    setFailed(false);
    setNavigationVersion((value) => value + 1);

    setIndex(
      (value) =>
        (value + direction + photos.length) % photos.length
    );

    record(tracker, "photoNavigated");
  }

  if (!photo) {
    return (
      <div className="photo-placeholder">
        <p>사진 자료 없음</p>
      </div>
    );
  }

  return (
    <div className="gallery">
      <Polaroid
        photo={photo}
        index={index}
        available={available}
        figureRef={figureRef}
        onLoad={() => setLoaded(true)}
        onError={() => {
          console.warn(
            `[PhotoGallery] ${photo.file} 사진 불러오기 실패. ` +
              "사진 배열의 경로와 실제 파일 확인 필요"
          );

          setFailed(true);
          setLoaded(false);
        }}
      />

      <div className="gallery-controls">
        <button
          type="button"
          className="button button-blue"
          onClick={() => change(-1)}
          disabled={photos.length < 2}
        >
          이전 사진
        </button>

        <span aria-live="polite" aria-atomic="true">
          {index + 1} / {photos.length}
        </span>

        <button
          type="button"
          className="button button-blue"
          onClick={() => change(1)}
          disabled={photos.length < 2}
        >
          다음 사진
        </button>
      </div>

      <p className="helper"></p>
    </div>
  );
}

/*
 * 설문 뒤에 놓이는 접이식 더 보기 구간.
 * 주소 해시나 내부 링크가 이 구간 안을 가리키면 자동으로 열림.
 */
export default function Festival({ tracker }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    let frameA = 0;
    let frameB = 0;

    function reveal(id) {
      const box = boxRef.current;

      if (!id || !box) return;

      const target = document.getElementById(id);
      const inside =
        id === "festival" || Boolean(target && box.contains(target));

      if (!inside) return;

      setOpen(true);

      window.cancelAnimationFrame(frameA);
      window.cancelAnimationFrame(frameB);

      frameA = window.requestAnimationFrame(() => {
        frameB = window.requestAnimationFrame(() => {
          document.getElementById(id)?.scrollIntoView({
            block: "start",
            behavior: "auto"
          });
        });
      });
    }

    function readHash() {
      try {
        reveal(decodeURIComponent(window.location.hash.slice(1)));
      } catch {
        /* 잘못된 해시는 무시함. */
      }
    }

    function onClick(event) {
      const link = event.target.closest?.('a[href^="#"]');

      if (link) reveal(link.getAttribute("href").slice(1));
    }

    readHash();

    window.addEventListener("hashchange", readHash);
    document.addEventListener("click", onClick);

    return () => {
      window.cancelAnimationFrame(frameA);
      window.cancelAnimationFrame(frameB);
      window.removeEventListener("hashchange", readHash);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <section
      id="festival"
      className="festival-section more-section container"
      aria-labelledby="more-title"
    >
      <details
        ref={boxRef}
        className="information-card more-details"
        open={open}
        onToggle={(event) => setOpen(event.currentTarget.open)}
      >
        <summary>
          <span id="more-title">더 보기</span>
          <span className="details-state" aria-hidden="true" />
        </summary>

        <div className="details-body more-body">
          <div
            className="more-group"
            data-track-section="festival-intro"
          >
            <p className="eyebrow text-blue">춘천마임축제 소개</p>

            <h3>몸짓으로 만나는 춘천</h3>

            <p className="lead">{festival.introduction}</p>

            <p>
              지난 축제 정보임. 정보 기준일 {festival.checkedAt}
            </p>

            <div className="info-grid">
              {infoCards.map((item) => (
                <InformationCard
                  key={item.id}
                  item={item}
                  tracker={tracker}
                />
              ))}
            </div>
          </div>

          <div
            className="more-group"
            data-track-section="festival-timeline"
          >
            <p className="eyebrow text-blue">이어져 온 몸짓</p>

            <h3>1989년부터 이어진 연혁</h3>

            <div
              className="film-window"
              role="region"
              aria-label="축제 연혁"
              tabIndex={0}
            >
              <ol className="timeline-grid">
                {timeline.map((item) => (
                  <li
                    key={item.label}
                    className="timeline-card"
                  >
                    <p className="timeline-year">{item.label}</p>

                    <h4>{item.title}</h4>

                    <p>{item.text}</p>

                    <SourceLink href={item.source} />
                  </li>
                ))}
              </ol>
            </div>

            <p className="helper film-hint">좌우 스크롤로 연혁 이동</p>
          </div>

          <div
            className="more-group"
            data-track-section="festival-theme"
          >
            <p className="eyebrow text-blue">2026년의 주제</p>

            <h3>몸풍경 소개</h3>

            <p className="lead">
              몸과 환경이 예술적 관계로 서로 스며드는 경험
            </p>

            <p>
              몸이 풍경이 되고 풍경이 다시 몸에 스며드는 순간을 떠올리는
              주제임.
            </p>

            <div className="theme-grid">
              {themeCards.map((item) => (
                <article
                  key={item.word}
                  className="theme-card"
                >
                  <span
                    className="theme-word"
                    aria-hidden="true"
                  >
                    {item.word}
                  </span>

                  <h4>{item.title}</h4>

                  <p>{item.text}</p>
                </article>
              ))}
            </div>

            <SourceLink href={sources.festival}>
              몸풍경 공식 설명 출처
            </SourceLink>
          </div>

          <div className="more-group program-section">
            <div
              className="section-heading"
              data-track-section="festival-program-intro"
            >
              <p className="eyebrow text-blue">대표 프로그램</p>

              <h3>프로그램 {programs.length}종과 장소</h3>

              <p className="lead">
                운영 상세는 공식 기록에 수록됨.
              </p>
            </div>

            <div className="program-grid">
              {programs.map((program) => (
                <PosterCard
                  key={program.id}
                  program={program}
                  sourceHref={sources.programs}
                  onInfoOpen={() => {
                    record(
                      tracker,
                      "infoOpened",
                      `program-${program.id}`
                    );
                  }}
                />
              ))}
            </div>
          </div>

          <div
            id="festival-photos"
            className="more-group gallery-layout"
            data-track-section="festival-photos"
          >
            <p className="eyebrow text-blue">사진 속의 축제</p>

            <h3>축제 사진</h3>

            <p>사진 속 몸짓과 장소 열람</p>

            <PhotoGallery tracker={tracker} />
          </div>

          <div
            id="story"
            className="more-group"
            data-track-section="character-story"
          >
            <p className="eyebrow text-blue">길잡이의 이야기</p>

            <h3>마에로의 세 모습</h3>

            <p>캐릭터 이야기 속 변화 소개</p>

            <div className="story-grid">
              {characters.map((character) => (
                <CollectCard
                  key={character.name}
                  character={character}
                />
              ))}
            </div>
          </div>

          <div className="more-group">
            <p className="eyebrow text-blue">세계관 컷</p>

            <h3>배웅의 장면</h3>

            <Worldview ids={["farewell"]} />
          </div>

          <Webtoon />
          <PlaceMap />
        </div>
      </details>
    </section>
  );
}