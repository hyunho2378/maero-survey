import { useEffect, useRef, useState } from "react";
import { hero, nav } from "./content.js";

/*
 * 고정 헤더. 좌 로고, 가운데 제목, 우 메뉴 버튼(플러스엑스 헤더 구성).
 * 맨 위에서는 투명, 내려가면 먹색 바탕과 그림자 1단계.
 * 설문 구간에서는 가운데 제목 자리에 진행 수와 얇은 진행 막대 표시.
 */
export default function PxHeader({ progress }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const firstLinkRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    function read() {
      frame = 0;
      setSolid(window.scrollY > 24);
    }
    function onScroll() {
      if (!frame) frame = window.requestAnimationFrame(read);
    }
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("px-menu-open", open);
    const background = [document.getElementById("main"), document.querySelector(".px-footer")].filter(Boolean);
    background.forEach((element) => {
      element.inert = open;
    });
    if (!open) return undefined;
    firstLinkRef.current?.focus();
    function onKey(event) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const showProgress = progress && progress.visible;

  return (
    <>
      <header className={`px-header ${solid && !open ? "is-solid" : ""}`}>
        <a className="px-header-brand" href="#top" onClick={() => setOpen(false)}>
          {hero.brand}
        </a>

        <p className={`px-header-center ${showProgress ? "is-progress" : ""}`}>
          {showProgress ? `설문 ${progress.answered} / ${progress.total}` : hero.center}
        </p>

        <button
          ref={buttonRef}
          type="button"
          className={`px-menu-button ${open ? "is-open" : ""}`}
          aria-expanded={open}
          aria-controls="px-menu"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="px-menu-bar" aria-hidden="true" />
          <span className="px-menu-bar" aria-hidden="true" />
        </button>

        <span
          className={`px-progress ${showProgress ? "is-on" : ""}`}
          aria-hidden="true"
          style={{ "--px-progress": showProgress ? progress.answered / progress.total : 0 }}
        />
      </header>

      <nav
        id="px-menu"
        className={`px-menu ${open ? "is-open" : ""}`}
        aria-label="주요 메뉴"
        aria-hidden={!open}
        inert={open ? undefined : ""}
      >
        <ol className="px-menu-list">
          {nav.map((item, index) => (
            <li key={item.href} style={{ "--i": index }}>
              <a
                ref={index === 0 ? firstLinkRef : undefined}
                href={item.href}
                onClick={() => setOpen(false)}
              >
                <span className="px-menu-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
