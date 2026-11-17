import React from "react";
import { createRoot } from "react-dom/client";

import { applyTokens, applyPxTokens } from "./tokens.js";

const isAdmin = new URLSearchParams(window.location.search).get("admin") === "1";
const root = createRoot(document.getElementById("root"));

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

if (isAdmin) {
  applyTokens();
  import("./admin-entry.jsx").then(({ default: Admin }) => {
    root.render(
      <React.StrictMode>
        <Admin />
      </React.StrictMode>
    );
  });
} else {
  applyPxTokens();
  Promise.all([import("./px/PxApp.jsx"), import("./styles-px.css")]).then(([{ default: PxApp }]) => {
    root.render(
      <React.StrictMode>
        <PxApp />
      </React.StrictMode>
    );
  });
}
