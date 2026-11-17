import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { festivalIntro, programs } from "./content.js";
import { ArrowIcon, Img, SectionHead } from "./ui.jsx";

/* 축제 소개: 대형 제목, 와이드 이미지, 좌 소제목 열과 우 본문 열 2단(플러스엑스 상세 구성) */
export function PxFestivalIntro() {
  return (
    <section id="festival" className="px-section px-festival" aria-labelledby="px-festival-title" data-track-section="festival-intro">
      <SectionHead id="px-festival-title" label={festivalIntro.label} title={festivalIntro.title} />

      <figure className="px-wide px-reveal">
        <Img file={festivalIntro.image} alt={festivalIntro.imageAlt} width={2752} height={1536} />
      </figure>

      <dl className="px-facts">
        {festivalIntro.facts.map((fact) => (
          <div key={fact.label} className="px-fact px-reveal">
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className="px-rows">
        {festivalIntro.rows.map((row) => (
          <div key={row.title} className="px-row px-reveal">
            <h3 className="px-row-title">{row.title}</h3>
            <div className="px-row-body">
              {row.body.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="px-source">
        <a href={festivalIntro.source} target="_blank" rel="noopener noreferrer">
          출처 춘천마임축제 누리집 축제 소개
        </a>
      </p>
    </section>
  );
}

/*
 * 대표 프로그램: 세로 카드 4장 격자. 카드를 누르면 플러스엑스 상세처럼
 * 화면 전체에 큰 장면과 좌우 2단 설명이 열림(직접 작성).
 */
function ProgramDetail({ item, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
    const background = [document.getElementById("main"), document.querySelector(".px-footer"), document.querySelector(".px-header")].filter(Boolean);
    background.forEach((element) => { element.inert = true; });
    document.documentElement.classList.add("px-menu-open");
    function onKey(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      background.forEach((element) => { element.inert = false; });
      document.documentElement.classList.remove("px-menu-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="px-detail" role="dialog" aria-modal="true" aria-labelledby="px-detail-title">
      <button ref={closeRef} type="button" className="px-detail-close" onClick={onClose} aria-label="상세 닫기">
        <span className="px-menu-bar" aria-hidden="true" />
        <span className="px-menu-bar" aria-hidden="true" />
      </button>
      <figure className="px-detail-media">
        <Img file={item.large || item.hover || item.image} alt={item.alt} width={1536} height={2752} eager />
      </figure>
      <div className="px-detail-body">
        <p className="px-detail-number">{item.number}</p>
        <h3 id="px-detail-title" className="px-display">{item.name}</h3>
        <dl className="px-detail-rows">
          <div className="px-row">
            <dt className="px-row-title">개최 장소</dt>
            <dd className="px-row-body"><p>{item.place}</p></dd>
          </div>
          <div className="px-row">
            <dt className="px-row-title">프로그램 소개</dt>
            <dd className="px-row-body">
              {item.detail.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </dd>
          </div>
        </dl>
        <a className="px-button is-blue" href={item.link.href} onClick={onClose}>
          {item.link.label}
          <ArrowIcon />
        </a>
      </div>
    </div>
  );
}

export function PxPrograms() {
  const [openId, setOpenId] = useState(null);
  const openerRef = useRef(null);
  const openItem = programs.items.find((item) => item.id === openId);

  function close() {
    setOpenId(null);
    window.requestAnimationFrame(() => openerRef.current?.focus({ preventScroll: true }));
  }

  return (
    <section id="programs" className="px-section px-programs" aria-labelledby="px-programs-title" data-track-section="festival-programs">
      <SectionHead id="px-programs-title" title={programs.title} />

      <ol className="px-program-grid" role="list">
        {programs.items.map((item, index) => (
          <li key={item.id} className={`px-program px-reveal tone-${item.tone}`} style={{ "--i": index }}>
            <button
              type="button"
              className="px-program-open"
              aria-haspopup="dialog"
              onClick={(event) => {
                openerRef.current = event.currentTarget;
                setOpenId(item.id);
              }}
            >
              <figure className="px-program-media">
                <Img file={item.image} alt={item.alt} width={700} height={1254} />
                {item.hover && <Img file={item.hover} className="px-program-hover" width={700} height={1254} />}
              </figure>
              <span className="px-program-number">{item.number}</span>
              <span className="px-program-name">{item.name}</span>
              <span className="px-program-place">{item.place}</span>
              <span className="px-program-summary">{item.summary}</span>
            </button>
          </li>
        ))}
      </ol>

      <p className="px-source">
        <a href={programs.source} target="_blank" rel="noopener noreferrer">
          출처 춘천마임축제 누리집 프로그램 안내
        </a>
      </p>

      {openItem && createPortal(<ProgramDetail item={openItem} onClose={close} />, document.body)}
    </section>
  );
}
