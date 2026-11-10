export function SourceLink({
  href,
  children = "공식 정보 출처"
}) {
  return (
    <a
      className="source-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

/* 설문 문항 사이에 두는 접이식 보조 카드. 기본은 닫힌 상태라 응답 흐름을 막지 않음. */
export default function HelpCard({ id, title, children }) {
  return (
    <details id={id} className="information-card help-card">
      <summary>
        <span>{title}</span>
        <span className="details-state" aria-hidden="true" />
      </summary>

      <div className="details-body">{children}</div>
    </details>
  );
}
