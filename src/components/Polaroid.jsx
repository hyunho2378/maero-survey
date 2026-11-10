import {
  useEffect,
  useId,
  useState
} from "react";

import { publicAsset } from "../config.js";
import Sheet from "./Sheet.jsx";

export default function Polaroid({
  photo,
  index,
  available,
  figureRef,
  onLoad,
  onError
}) {
  const generatedId = useId();
  const sheetId = `photo-sheet-${generatedId}`;

  const [open, setOpen] = useState(false);
  const [detailFailed, setDetailFailed] = useState(false);

  useEffect(() => {
    setOpen(false);
    setDetailFailed(false);
  }, [photo.id, photo.file]);

  useEffect(() => {
    if (!available) {
      setOpen(false);
    }
  }, [available]);

  function openDetail() {
    setDetailFailed(false);
    setOpen(true);
  }

  return (
    <>
      <figure
        ref={figureRef}
        className="gallery-figure polaroid"
        data-tilt={index % 3}
      >
        {available ? (
          <button
            type="button"
            className="polaroid-photo-button"
            aria-label={`${photo.description} 크게 보기`}
            aria-controls={sheetId}
            aria-expanded={open}
            onClick={openDetail}
          >
            <img
              key={photo.id}
              src={publicAsset(photo.file)}
              alt={photo.description}
              width="1600"
              height="1000"
              loading="lazy"
              decoding="async"
              onLoad={onLoad}
              onError={onError}
            />
          </button>
        ) : (
          <div className="photo-placeholder">
            <span className="eyebrow">
              축제 사진
            </span>

            <h4>사진 준비 중</h4>

            <p>{photo.description}</p>

            <p>
              실제 사진과 출처가 들어오면 이곳에서 넘겨 보기 가능
            </p>
          </div>
        )}

        <figcaption>
          <p>{photo.description}</p>

          {available && (
            <a
              className="source-link"
              href={photo.source}
              target="_blank"
              rel="noopener noreferrer"
            >
              이 사진의 출처 확인
            </a>
          )}
        </figcaption>
      </figure>

      <Sheet
        id={sheetId}
        open={open && available}
        onClose={() => setOpen(false)}
        title="사진 속의 축제"
      >
        {open && available && (
          <figure className="ios-photo-detail">
            {detailFailed ? (
              <p role="status">
                사진 불러오기 실패. 닫은 뒤 다시 열기 필요
              </p>
            ) : (
              <img
                src={publicAsset(photo.file)}
                alt={photo.description}
                width="1600"
                height="1000"
                decoding="async"
                onError={() => {
                  console.warn(
                    `[Polaroid] ${photo.file} 상세 이미지를 ` +
                      "불러오지 못했습니다."
                  );

                  setDetailFailed(true);
                }}
              />
            )}

            <figcaption>
              <p>{photo.description}</p>

              <a
                className="source-link"
                href={photo.source}
                target="_blank"
                rel="noopener noreferrer"
              >
                이 사진의 출처 확인
              </a>
            </figcaption>
          </figure>
        )}
      </Sheet>
    </>
  );
}
