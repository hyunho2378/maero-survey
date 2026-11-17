import {
  config,
  isRemote,
  emailEnabled
} from "../config.js";

const recordItems = [
  "답변",
  "화면을 본 시간",
  "영상 재생 시간",
  "사진 열람 횟수",
  "정보 카드 열람 횟수",
  "유입 표식",
  "화면 너비",
  "소요 시간",
  "제출 시각"
];

export default function PrivacyNotice({
  full = false,
  compact = false
}) {
  const body = (
    <div className="privacy-copy">
      <p>답변과 함께 아래 이용 기록이 저장돼요.</p>

      <ul className="privacy-items" role="list">
        {recordItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <p>이름과 전화번호는 받지 않아요.</p>

      <p>제출하기 전까지 기록은 이 페이지 안에만 있다가, 제출하면 답변과 함께 저장돼요.</p>

      <p>
        {isRemote
          ? `응답은 제출한 날부터 ${config.retentionDays}일 동안 보관해요.`
          : "답변은 이 기기 안에만 임시로 저장되고 운영팀에는 전달되지 않아요."}
      </p>

      {full && (
        <>
          <p>
            저장한 기록은 춘천마임축제 영상을 본 경험과 관심의 변화를 알아보는 데만 써요.
          </p>

          <p>
            이메일은 동의하신 분께 축제 소식을 보내는 데만 써요.
          </p>

          <p>이메일을 남기지 않아도 설문에 참여할 수 있어요.</p>

          <p>소식 신청 동의는 언제든 거둘 수 있어요.</p>
        </>
      )}

      {emailEnabled && (
        <p>
          개인정보 문의와 동의 철회는{" "}
          <a href={`mailto:${config.privacyContact}`}>
            {config.privacyContact}
          </a>
          로 연락해 주세요.
        </p>
      )}
    </div>
  );

  if (!compact) return body;

  return (
    <details className="information-card help-card privacy-details">
      <summary>
        <span>저장되는 기록과 보관 기간</span>
        <span className="details-state" aria-hidden="true" />
      </summary>

      <div className="details-body">{body}</div>
    </details>
  );
}
