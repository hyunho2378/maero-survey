import { useEffect, useRef, useState } from "react";
import { festival } from "../data/festival.js";

export default function Marquee() {
  const rootRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);

  const items = [
    `${festival.name} ${festival.theme}`,
    festival.period,
    "마에로와 삐삐로"
  ];

  useEffect(() => {
    const node = rootRef.current;

    if (!node || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setVisible(Boolean(entry?.isIntersecting));
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="marquee"
      data-paused={paused || !visible ? "true" : "false"}
    >
      <p className="sr-only">{items.join(". ")}</p>

      <div className="marquee-window" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div className="marquee-group" key={copy}>
              {items.map((item) => (
                <span className="marquee-item" key={`${copy}-${item}`}>
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="marquee-toggle"
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
      >
        {paused ? "흐름 이어가기" : "흐름 멈추기"}
      </button>
    </div>
  );
}
