import {
  useEffect,
  useRef,
  useState
} from "react";

import { MotionButton } from "./Character.jsx";
import PrivacyNotice from "./PrivacyNotice.jsx";
import Sheet from "./Sheet.jsx";
import { PipiroSticker } from "./Stickers.jsx";

import { festival, sources, videos } from "../data/festival.js";

const navigationItems = [
  {
    href: "#survey",
    label: "설문"
  },
  {
    href: "#newsletter",
    label: "소식 신청"
  },
  {
    href: "#festival",
    label: "추가 정보"
  }
];

export function Header() {
  const headerRef = useRef(null);
  const largeTitleRef = useRef(null);

  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    const largeTitle = largeTitleRef.current;

    if (!header || !largeTitle) {
      console.warn(
        "[Header] 내비게이션 또는 큰 제목 참조 없음. " +
          "headerRef와 largeTitleRef 연결 확인 필요"
      );

      return undefined;
    }

    const root = document.documentElement;
    let frame = 0;

    function clamp(value) {
      return Math.min(1, Math.max(0, value));
    }

    /*
     * 화면 위치를 읽어 CSS 변수 두 개만 기록하는 표현 전용 처리입니다.
     * --title-progress: 큰 제목이 상단 바 제목으로 줄어든 정도 (0~1)
     * --glass-density: 스크롤에 따라 유리 재질이 진해진 정도 (0~1)
     */
    function measure() {
      frame = 0;

      /* 시트가 열려 body가 고정된 동안에는 값을 유지합니다. */
      if (document.body.style.position === "fixed") return;

      const headerBottom = header.getBoundingClientRect().bottom;
      const titleRect = largeTitle.getBoundingClientRect();
      const span = Math.max(1, titleRect.height);

      const progress = clamp(
        1 - (titleRect.bottom - headerBottom) / span
      );

      const density = clamp(
        (headerBottom - titleRect.top) / 48
      );

      root.style.setProperty(
        "--title-progress",
        progress.toFixed(3)
      );

      root.style.setProperty(
        "--glass-density",
        density.toFixed(3)
      );

      setCompact(titleRect.bottom <= headerBottom);
    }

    function scheduleMeasure() {
      if (frame) return;

      frame = window.requestAnimationFrame(measure);
    }

    measure();

    window.addEventListener("scroll", scheduleMeasure, {
      passive: true
    });

    window.addEventListener("resize", scheduleMeasure);

    let observer = null;

    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(scheduleMeasure);
      observer.observe(header);
      observer.observe(largeTitle);
    }

    return () => {
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);

      observer?.disconnect();

      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      root.style.removeProperty("--title-progress");
      root.style.removeProperty("--glass-density");
    };
  }, []);

  function navigate(event, href) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();
    setMenuOpen(false);

    window.requestAnimationFrame(() => {
      window.location.hash = href;

      document
        .getElementById(href.slice(1))
        ?.scrollIntoView({
          block: "start",
          behavior: "auto"
        });
    });
  }

  return (
    <>
      <header
        ref={headerRef}
        className="site-header ios-site-header"
        data-compact={compact ? "true" : "false"}
      >
        <div className="ios-nav-inner">
          <a
            className="ios-nav-button"
            href="#main"
            aria-label="마에로와 삐삐로 첫 화면으로 이동"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="m12 1 3.2 7 7.8 1-5.7 5.3 1.5 7.7-6.8-3.8L5.2 22l1.5-7.7L1 9l7.8-1Z"
                fill="currentColor"
              />
            </svg>
          </a>

          <span
            className="ios-nav-title"
            aria-hidden={!compact}
          >
            마에로와 삐삐로
          </span>

          <button
            type="button"
            className="ios-nav-button"
            aria-label="페이지 메뉴 열기"
            aria-controls="page-navigation-sheet"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              aria-hidden="true"
              focusable="false"
            >
              <circle
                cx="5"
                cy="12"
                r="2"
                fill="currentColor"
              />

              <circle
                cx="12"
                cy="12"
                r="2"
                fill="currentColor"
              />

              <circle
                cx="19"
                cy="12"
                r="2"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </header>

      <div
        ref={largeTitleRef}
        className="ios-large-title-region"
      >
        <p className="ios-large-title">
          마에로와 삐삐로
        </p>
      </div>

      <Sheet
        id="page-navigation-sheet"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="페이지 안 이동"
      >
        <nav
          className="ios-nav-menu"
          aria-label="페이지 안 이동"
        >
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(event) => {
                navigate(event, item.href);
              }}
            >
              <span>{item.label}</span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                width="20"
                height="20"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="m7 4 6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          ))}
        </nav>
      </Sheet>
    </>
  );
}

/* 첫 화면 한 장: 제목, 한 줄 소개, 설문 시작 버튼. 이어서 바로 설문이 시작됨. */
export function Landing() {
  return (
    <section
      id="intro"
      className="main-form-intro container"
      aria-labelledby="intro-title"
      data-track-section="hero"
    >
      <h1 id="intro-title">춘천마임축제 관심 설문</h1>

      <p className="lead">
        영상 {videos.length}편 시청 후 문항 8개에 응답
      </p>

      <a className="button button-blue" href="#survey">
        설문 시작
      </a>

      <p className="helper">
        한림대 학생 창업팀 버터와플 제작. 춘천마임축제 공식 페이지가 아님.
      </p>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-bookmark">
        <PipiroSticker size="lg" tilt="right" />

        <p>몸짓으로 만나는 축제</p>
      </div>

      <div className="container footer-grid">
        <div>
          <h2>버터와플 제작</h2>

          <p>
            한림대 학생 창업팀 버터와플이 마에로와 삐삐로를 통해 축제
            경험을 살펴보는 설문임.
          </p>

          <p>춘천마임축제 공식 운영 페이지가 아님.</p>
        </div>

        <div>
          <h3>공식 정보 출처</h3>

          <p>정보 기준일 {festival.checkedAt}</p>

          <ul className="source-list">
            <li>
              <a
                href={sources.festival}
                target="_blank"
                rel="noopener noreferrer"
              >
                춘천마임축제 소개 [1]
              </a>
            </li>

            <li>
              <a
                href={sources.programs}
                target="_blank"
                rel="noopener noreferrer"
              >
                대표 프로그램 [2]
              </a>
            </li>

            <li>
              <a
                href={sources.history}
                target="_blank"
                rel="noopener noreferrer"
              >
                축제 연혁 [3]
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div
        id="privacy"
        className="container privacy-section"
      >
        <h3>기록과 개인정보 안내</h3>

        <PrivacyNotice full />
      </div>

      <div className="container">
        <MotionButton />
      </div>
    </footer>
  );
}