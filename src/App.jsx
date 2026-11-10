import { useEffect, useState } from "react";

import "./styles-main-form.css";

import { createTracker } from "./lib/tracking.js";
import {
  MotionProvider
} from "./components/Character.jsx";
import {
  Header,
  Landing,
  Footer
} from "./components/Landing.jsx";
import Festival from "./components/Festival.jsx";
import Survey from "./components/Survey.jsx";

export default function App() {
  const [tracker] = useState(() => createTracker());

  useEffect(() => {
    const stop = tracker.start();
    return stop;
  }, [tracker]);

  return (
    <MotionProvider>
      <a className="skip-link" href="#main">
        본문으로 이동
      </a>

      <Header />

      {/* 순서: 첫 화면, 설문, 더 보기. 소개 구간은 설문 뒤 접이식으로만 둠. */}
      <main id="main" className="main-form">
        <Landing />

        <Survey tracker={tracker} />

        <Festival tracker={tracker} />
      </main>

      <Footer />
    </MotionProvider>
  );
}
