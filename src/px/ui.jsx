import { useEffect } from "react";
import { publicAsset } from "../config.js";
import { lines } from "./content.js";

/* 구절 단위 줄바꿈. |마다 한 줄 */
export function Lines({ text }) {
  const parts = lines(text);
  return parts.map((part, index) => (
    <span key={index} className="px-line" style={{ "--l": index }}>
      <span className="px-line-in">{part}</span>
    </span>
  ));
}

export function Img({ file, alt = "", className = "", eager = false, width, height }) {
  return (
    <img
      className={className}
      src={publicAsset(file)}
      alt={alt}
      aria-hidden={alt ? undefined : "true"}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      width={width}
      height={height}
      draggable="false"
    />
  );
}

/*
 * 스크롤 진입 연출. .px-reveal 요소가 화면에 들어오면 is-in을 붙임.
 * opacity와 transform만 바뀜. 한 번 보이면 다시 숨기지 않음.
 */
export function useRevealAll(dependency) {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll(".px-reveal:not(.is-in)"));
    if (!("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-in"));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [dependency]);
}

export function SectionHead({ id, title, dark = true }) {
  return (
    <header className={`px-head ${dark ? "" : "is-light"}`}>
      <h2 id={id} className="px-display px-reveal">
        <Lines text={title} />
      </h2>
    </header>
  );
}

export function ArrowIcon() {
  return (
    <svg className="px-arrow" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}
