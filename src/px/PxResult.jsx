import { Img } from "./ui.jsx";

/* 제출 완료 카드(구글 폼 확인 화면 모양). 붓을 든 기본 마에로가 가운데에 나오고 감사 문구만 둠 */
export default function PxResult() {

  return (
    <div id="result" className="px-result" role="region" aria-labelledby="result-title">
      <div className="px-result-body">
        <figure className="px-result-art">
          <Img file="img/orig/maero_v3.png" alt="붓과 팔레트를 든 마에로와 삐삐로" width={900} height={800} eager />
        </figure>
        <h2 id="result-title" className="px-result-title">
          설문에 참여해 주셔서 감사합니다.
        </h2>
        <p className="px-result-text">응답이 제출되었습니다.</p>
      </div>
    </div>
  );
}
