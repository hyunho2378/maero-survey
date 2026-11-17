import PrivacyNotice from "../components/PrivacyNotice.jsx";
import { footerCopy, nav } from "./content.js";
import { ArrowIcon } from "./ui.jsx";

/* 하단 막대(푸터, 직접 작성). 출처, 기준일, 개인정보 안내, 외곽선 대형 글자 */
export default function PxFooter() {
  return (
    <footer className="px-footer">
      <div className="px-footer-grid">
        <div className="px-footer-col">
          <h2 className="px-footer-title">바로가기</h2>
          <ul role="list">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="px-footer-col">
          <h2 className="px-footer-title">공식 정보 출처</h2>
          <ul role="list">
            {footerCopy.links.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="px-footer-date">{footerCopy.date}</p>
        </div>
        <div id="privacy" className="px-footer-col px-footer-privacy">
          <h2 className="px-footer-title">기록과 개인정보 안내</h2>
          <PrivacyNotice full />
        </div>
      </div>
      <a className="px-top-button" href="#top">
        맨 위로 이동
        <ArrowIcon />
      </a>
      <p className="px-footer-word" aria-hidden="true">
        {footerCopy.wordmark}
      </p>
    </footer>
  );
}
