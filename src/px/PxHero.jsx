import { hero } from "./content.js";
import { ArrowIcon, Img, Lines } from "./ui.jsx";

/*
 * 첫 화면. 외곽선 대형 제목과 단색 대형 제목 위로
 * 세로 10대 16.2 카드 격자가 겹침. 카드는 색 막대가 오른쪽으로 밀려나며 드러남.
 */
export default function PxHero() {
  return (
    <section id="top" className="px-hero" aria-labelledby="px-hero-title">
      <div className="px-hero-top">
        <h1 id="px-hero-title" className="px-mega">
          <span className="px-mega-outline">{hero.outline}</span>{" "}
          <span className="px-mega-solid">{hero.solid}</span>
        </h1>

        <div className="px-hero-foot">
          <p className="px-hero-intro">
            <Lines text={hero.intro} />
          </p>
          <p className="px-hero-period">{hero.period}</p>
        </div>
        <div className="px-hero-actions">
          <a className="px-button is-blue" href="#survey">
            {hero.start}
            <ArrowIcon />
          </a>
          <a className="px-button is-ghost" href="#festival">
            {hero.more}
          </a>
        </div>
      </div>

      <ul className="px-hero-grid" role="list" aria-hidden="true">
        {hero.cards.map((card, index) => (
          <li key={card.file} className={`px-hero-card wipe-${card.wipe}`} style={{ "--i": index }}>
            <Img file={card.file} eager={index < 4} width={700} height={1254} />
          </li>
        ))}
      </ul>

    </section>
  );
}
