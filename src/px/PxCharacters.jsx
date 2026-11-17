import { characterIntro } from "./content.js";
import { Img, SectionHead } from "./ui.jsx";

/* 캐릭터 소개: 단체 컷 와이드 한 장과 네 모습 카드. 축제 정보보다 짧게 둠 */
export default function PxCharacters() {
  return (
    <section id="characters" className="px-section px-characters" aria-labelledby="px-characters-title" data-track-section="characters">
      <SectionHead id="px-characters-title" label={characterIntro.label} title={characterIntro.title} />

      <figure className="px-wide is-paper px-reveal">
        <Img file={characterIntro.image} alt={characterIntro.imageAlt} width={2752} height={1536} />
      </figure>

      <ul className="px-character-grid" role="list">
        {characterIntro.items.map((item, index) => (
          <li key={item.name} className="px-character px-reveal" style={{ "--i": index }}>
            <div className="px-character-art">
              <Img file={item.image} width={600} height={600} />
            </div>
            <h3 className="px-character-name">{item.name}</h3>
            <p className="px-character-text">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
