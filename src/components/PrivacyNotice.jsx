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
      <p>기록 항목</p>

      <ul className="privacy-items" role="list">
        {recordItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <p>이름과 전화번호는 받지 않음.</p>

      <p>
        제출 전 탐색 기록은 이 페이지 메모리에만 보관됨.
        제출 후에는 답변과 함께 저장
      </p>

      <p>
        {isRemote
          ? `응답은 팀이 운영하는 서버의 Neon 데이터베이스에 ${config.retentionDays}일 보관`
          : "답변과 선택 이메일은 이 기기 안에만 임시 저장되며 팀에 전달되지 않음."}
      </p>

      {full && (
        <>
          <p>
            기록 사용 목적은 축제 콘텐츠 열람 경험과 관심 변화 조사임.
          </p>

          <p>
            이메일 사용 범위는 동의한 응답자 대상 축제 소식 전달
          </p>

          <p>
            보관 기간은 제출일부터 {config.retentionDays}일임.
            {isRemote
              ? " 만료된 기록은 서버에서 정리"
              : " 만료된 기록은 다음 접속이나 조회 때 이 브라우저에서 정리"}
          </p>

          <p>
            이메일 미입력 시에도 설문 참여 가능.
            소식 신청 동의는 언제든 철회 가능함.
          </p>

          <p>
            영상 불러오기 시 YouTube로 연결되며 YouTube의 데이터 처리
            방식을 따름.
          </p>
        </>
      )}

      {emailEnabled ? (
        <p>
          개인정보 문의와 동의 철회 연락처{" "}
          <a href={`mailto:${config.privacyContact}`}>
            {config.privacyContact}
          </a>
        </p>
      ) : (
        <p>
          공개 문의 주소 준비 중.
          주소 확정 전까지 소식용 이메일 수집 없음.
        </p>
      )}
    </div>
  );

  if (!compact) return body;

  return (
    <>
      <p>
        이름과 전화번호는 받지 않으며 기록은 제출 시 답변과 함께 저장됨.
      </p>

      <details className="information-card help-card privacy-details">
        <summary>
          <span>기록 항목과 보관 기간</span>
          <span className="details-state" aria-hidden="true" />
        </summary>

        <div className="details-body">{body}</div>
      </details>
    </>
  );
}
