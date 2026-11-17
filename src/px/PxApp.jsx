import { useCallback, useEffect, useState } from "react";
import { createTracker } from "../lib/tracking.js";
import PxHeader from "./PxHeader.jsx";
import PxHero from "./PxHero.jsx";
import { PxFestivalIntro, PxPrograms } from "./PxFestival.jsx";
import PxPlaces from "./PxPlaces.jsx";
import PxCharacters from "./PxCharacters.jsx";
import PxSurvey from "./PxSurvey.jsx";
import PxFooter from "./PxFooter.jsx";
import { useRevealAll } from "./ui.jsx";

/* v36 공개 화면 뼈대(직접 작성). 축제 정보 구간을 캐릭터와 설문보다 앞에 둠 */
const showInfo = new URLSearchParams(window.location.search).get("page") === "info";

export default function PxApp() {
  return showInfo ? <PxInfoPage /> : <PxFormPage />;
}

/* 설문만 있는 구글 폼형 화면. 축제 소개와 캐릭터 구간은 ?page=info 로 분리 */
function PxFormPage() {
  const [tracker] = useState(() => createTracker());
  const [progress, setProgress] = useState({ visible: false, answered: 0, total: 8 });
  useEffect(() => {
    const stop = tracker.start();
    return stop;
  }, [tracker]);
  useRevealAll(true);
  const onProgress = useCallback((next) => {
    setProgress((current) =>
      current.visible === next.visible && current.answered === next.answered && current.total === next.total ? current : next
    );
  }, []);
  return (
    <>
      <a className="px-skip" href="#main">
        본문으로 이동
      </a>
      <span
        className={`px-formbar ${progress.visible ? "is-on" : ""}`}
        aria-hidden="true"
        style={{ "--px-progress": progress.total ? progress.answered / progress.total : 0 }}
      />
      <main id="main" className="px-main px-formpage" tabIndex={-1}>
        <PxSurvey tracker={tracker} onProgress={onProgress} />
      </main>
    </>
  );
}

function PxInfoPage() {
  const [tracker] = useState(() => createTracker());
  const [progress, setProgress] = useState({ visible: false, answered: 0, total: 8 });

  useEffect(() => {
    const stop = tracker.start();
    return stop;
  }, [tracker]);

  /* 첫 진입 로딩 막대: 첫 화면 이미지가 모두 불러와지면 끝까지 차고 사라짐 */
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const images = Array.from(document.querySelectorAll(".px-hero img"));
    const waits = images.map((image) =>
      image.complete ? Promise.resolve() : new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      })
    );
    const timer = window.setTimeout(() => setLoaded(true), 2500);
    Promise.all(waits).then(() => setLoaded(true));
    return () => window.clearTimeout(timer);
  }, []);

  useRevealAll(progress.visible);

  const onProgress = useCallback((next) => {
    setProgress((current) =>
      current.visible === next.visible && current.answered === next.answered && current.total === next.total ? current : next
    );
  }, []);

  return (
    <>
      <span className={`px-loading ${loaded ? "is-done" : ""}`} aria-hidden="true" />
      <a className="px-skip" href="#main">
        본문으로 이동
      </a>
      <PxHeader progress={progress} />
      <main id="main" className="px-main" tabIndex={-1}>
        <PxHero />
        <PxFestivalIntro />
        <PxPrograms />
        <PxPlaces />
        <PxCharacters />
        <PxSurvey tracker={tracker} onProgress={onProgress} />
      </main>
      <PxFooter />
    </>
  );
}
