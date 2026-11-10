import { useEffect, useRef } from "react";

import Character from "./Character.jsx";
import { publicAsset } from "../config.js";
import { characters, sources } from "../data/festival.js";

const sceneImage = publicAsset("img/scene_farewell.jpg");

export default function Result({ payload, receipt }) {
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const before = payload.answers.before;
  const after = payload.answers.after;
  const difference = after - before;

  const differenceText =
    difference > 0
      ? `처음 대비 ${difference}점 상승`
      : difference < 0
        ? `처음 대비 ${Math.abs(difference)}점 하락`
        : "처음과 같은 점수";

  return (
    <section
      className="result-stage"
      style={{ backgroundImage: `url("${sceneImage}")` }}
    >
      <div
        id="result"
        className="result-card"
        role="region"
        aria-labelledby="result-title"
      >
        <p className="eyebrow text-blue result-eyebrow">
          설문 참여 감사
        </p>

        <h2
          id="result-title"
          ref={headingRef}
          tabIndex={-1}
        >
          {receipt.mode === "remote"
            ? "응답 전달 완료"
            : "이 기기에 응답 저장"}
        </h2>

        {receipt.mode === "local" && (
          <p className="result-note">
            이 응답은 팀에 전달되지 않음.
          </p>
        )}

        <div className="result-characters">
          {characters.map((character, index) => (
            <figure key={character.name} className={`result-figure result-figure-${index + 1}`}>
              <div className="result-character-stage">
                <div className="result-character-float">
                  <Character name={character.name} />
                </div>
                <span className="result-character-shadow" aria-hidden="true" />
              </div>
              <figcaption>{character.title}</figcaption>
            </figure>
          ))}
        </div>

        <div className="result-scores">
          <div>
            <span>처음 마음</span>
            <strong>{before}점</strong>
          </div>

          <div>
            <span>지금 마음</span>
            <strong>{after}점</strong>
          </div>
        </div>

        <p className="lead">{differenceText}</p>

        <p className="result-disclaimer">
          점수는 이 페이지에서 남긴 내 마음의 변화 기록임.
          영상이나 사진 때문에 달라졌다고 단정하지 않음.
        </p>

        <div id="newsletter" className="result-newsletter">
          {payload.answers.email ? (
            <p>
              {receipt.mode === "remote"
                ? "동의한 이메일도 함께 제출함. 소식 발송 완료를 뜻하지 않음."
                : "이메일도 이 기기에만 저장함. 소식 신청은 팀에 전달되지 않음."}
            </p>
          ) : (
            <p>이메일 없이 설문 참여</p>
          )}
        </div>

        <a
          className="button button-blue"
          href={sources.official}
          target="_blank"
          rel="noopener noreferrer"
        >
          축제 공식 사이트 방문
        </a>
      </div>
    </section>
  );
}