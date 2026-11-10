import { Artwork } from "./CollectCard.jsx";

export default function PosterCard({
  program,
  sourceHref,
  onInfoOpen
}) {
  const titleId = `program-${program.id}-title`;

  return (
    <article
      className={`program-card poster-card accent-${program.tone}`}
      data-track-section={`program-${program.id}`}
      aria-labelledby={titleId}
    >
      <div className="poster-top">
        <div className="poster-image">
          <Artwork
            file={`img/${program.scene}`}
            width={1500}
            height={1000}
          />
        </div>

        <h4 id={titleId} className="poster-label">
          {program.posterLabel}
        </h4>
      </div>

      <div className="poster-body">
        <div className="poster-meta">
          <span className="program-number" aria-hidden="true">
            {program.number}
          </span>

          <p className="program-place">{program.place}</p>
        </div>

        <p>{program.prompt}</p>

        <details
          className="program-details"
          onToggle={(event) => {
            if (!event.currentTarget.open) return;

            if (typeof onInfoOpen !== "function") {
              console.warn(
                `[PosterCard] ${program.id}의 onInfoOpen 연결 없음. ` +
                  "Festival의 PosterCard 연결 확인 필요"
              );
              return;
            }

            onInfoOpen();
          }}
        >
          <summary>장면 상세</summary>

          <p>{program.detail}</p>

          <a
            className="source-link"
            href={sourceHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            프로그램 출처
          </a>
        </details>

        <a
          className="button button-blue"
          href={program.destination}
        >
          {program.linkLabel}
        </a>
      </div>
    </article>
  );
}
