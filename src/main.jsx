import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import Admin from "./components/Admin.jsx";
import { applyTokens } from "./tokens.js";

import "./styles.css";
import "./styles-kitsch.css";
import "./styles-ios.css";
import "./styles-glass.css";
import "./styles-hero.css";
import "./styles-hero-slides.css";
import "./styles-survey.css";
import "./styles-result.css";
import "./styles-festival.css";
import "./styles-keepsakes.css";
import "./styles-worldview.css";
import "./styles-webtoon.css";
import "./styles-placemap.css";
import "./styles-a11y-sections.css";
import "./styles-a11y.css";
import "./styles-contrast-fix.css";
import "./styles-forced-colors-sections.css";

applyTokens();

const isAdmin =
  new URLSearchParams(window.location.search).get("admin") ===
  "1";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isAdmin ? <Admin /> : <App />}
  </React.StrictMode>
);