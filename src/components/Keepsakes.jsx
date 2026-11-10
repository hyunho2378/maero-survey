import { Artwork } from "./CollectCard.jsx";

/* 기념품 사진 3장. 설문 기념품 문항 앞의 접이식 카드 안에서 쓰임. */
const keepsakes = [
  {
    id: "keyring-bag",
    file: "img/keepsake_keyring_bag.jpg",
    title: "키링",
    text: "파란 마에로 키링이 가방에 달린 모습",
    alt: "파란 마에로 아크릴 키링이 책가방에 달려 있는 모습"
  },
  {
    id: "keyring-desk",
    file: "img/keepsake_keyring_desk.jpg",
    title: "붓 팔레트 키링",
    text: "책상 위에 놓인 모습",
    alt: "붓과 팔레트 모양 아크릴 키링이 책상 위에 놓인 모습"
  },
  {
    id: "postcards-desk",
    file: "img/keepsake_postcards_desk.jpg",
    title: "엽서 4장면",
    text: "도착에서 배웅까지 네 장면이 한 세트임.",
    alt: "엽서 네 장이 책상 위에 펼쳐진 모습"
  }
];

export default function Keepsakes() {
  return (
    <div
      id="keepsakes"
      className="keepsakes-section"
      data-track-section="festival-keepsakes"
    >
      <ul className="keepsake-grid" role="list">
        {keepsakes.map((item) => (
          <li key={item.id}>
            <article
              className="keepsake-card"
              aria-labelledby={`keepsake-${item.id}-title`}
            >
              <div className="keepsake-media">
                <Artwork
                  className="keepsake-photo"
                  file={item.file}
                  alt={item.alt}
                  width={1600}
                  height={1194}
                />
              </div>

              <div className="keepsake-body">
                <h4 id={`keepsake-${item.id}-title`}>{item.title}</h4>

                <p>{item.text}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
