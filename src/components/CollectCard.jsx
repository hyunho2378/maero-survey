import { useId, useState } from "react";
import { publicAsset } from "../config.js";

/*
 * 장식 이미지와 캐릭터 이미지의 표현 전용 컴포넌트입니다.
 * 실제 사진 조회와 영상 추적에는 연결하지 않습니다.
 */
export function Artwork({
  file,
  fallbackFile = "",
  alt = "",
  className = "",
  eager = false,
  width = 1024,
  height = 1024
}) {
  const [failedFiles, setFailedFiles] = useState([]);

  const selectedFile =
    file && !failedFiles.includes(file)
      ? file
      : fallbackFile && !failedFiles.includes(fallbackFile)
        ? fallbackFile
        : "";

  function imageFailed() {
    if (!selectedFile) return;

    console.warn(
      `[Artwork] ${selectedFile} 이미지를 불러오지 못했습니다. ` +
        "public/img의 파일명과 publicAsset 경로를 확인해 주세요."
    );

    setFailedFiles((current) =>
      current.includes(selectedFile)
        ? current
        : [...current, selectedFile]
    );
  }

  if (!selectedFile) {
    if (!alt) {
      return (
        <span
          className={`artwork-unavailable ${className}`}
          aria-hidden="true"
        />
      );
    }

    return (
      <div
        className={`artwork-unavailable ${className}`}
        role="img"
        aria-label={`${alt}. 그림 준비 중`}
      >
        그림 준비 중
      </div>
    );
  }

  return (
    <img
      key={selectedFile}
      className={`kitsch-artwork ${className}`}
      src={publicAsset(selectedFile)}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable="false"
      onError={imageFailed}
    />
  );
}

/*
 * 앞면: 3:4 소개 카드 사진 + 글래스 캡션 띠(번호, 제목, cardLine)
 * 뒷면: 같은 사진 위에 글래스 패널(번호, 기존 text)
 * 카드 전체를 덮는 버튼 하나가 뒤집기를 맡습니다.
 *
 * 안쪽 요소는 기존 스타일시트의 collect-* 규칙과 겹치지 않도록
 * cc- 접두어의 새 클래스를 씁니다. 바깥 article의 클래스는 그대로입니다.
 */
export default function CollectCard({ character }) {
  const [flipped, setFlipped] = useState(false);
  const generatedId = useId();

  const titleId = `${generatedId}-title`;
  const deckId = `${generatedId}-deck`;

  return (
    <article
      className={`story-card collect-card collect-${character.tone}`}
      aria-labelledby={titleId}
    >
      <div
        id={deckId}
        className="cc-faces"
        data-flipped={flipped ? "true" : "false"}
      >
        <div className="cc-face cc-front" aria-hidden={flipped}>
          <Artwork
            className="cc-photo"
            file={character.cardImage}
            fallbackFile={character.image}
            alt={character.title}
            width={896}
            height={1200}
          />

          <div className="cc-caption">
            <div className="cc-caption-head">
              <span className="cc-number">{character.number}</span>

              <h4 id={titleId}>{character.title}</h4>
            </div>

            <p className="cc-line">{character.cardLine}</p>
          </div>
        </div>

        <div className="cc-face cc-back" aria-hidden={!flipped}>
          <Artwork
            className="cc-photo cc-back-photo"
            file={character.cardImage}
            fallbackFile={character.image}
            alt=""
            width={896}
            height={1200}
          />

          <div className="cc-panel">
            <span className="cc-number">{character.number}</span>

            <p className="cc-text">{character.text}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="cc-flip"
        aria-controls={deckId}
        aria-pressed={flipped}
        aria-label={`${character.title}, ${
          flipped ? "앞면 확인" : "뒷면 확인"
        }`}
        onClick={() => setFlipped((value) => !value)}
      />
    </article>
  );
}