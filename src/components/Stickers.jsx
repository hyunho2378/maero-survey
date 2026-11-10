import { Fragment } from "react";

function StickerFrame({
  children,
  size = "md",
  tilt = "none",
  className = ""
}) {
  return (
    <svg
      className={`sticker sticker--${size} sticker--${tilt} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width="64"
      height="64"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g
        stroke="var(--white)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        paintOrder="stroke fill"
      >
        {children}
      </g>
    </svg>
  );
}

export function Phrase({ text, className = "" }) {
  const parts = text.split("|");

  return (
    <span className={`phrase-group ${className}`}>
      {parts.map((part, index) => (
        <Fragment key={`${index}-${part}`}>
          {index > 0 ? " " : null}
          <span className="phrase-unit">{part}</span>
        </Fragment>
      ))}
    </span>
  );
}

/* 1. Maero eye motif */

export function MaeroEyesSticker(props) {
  return (
    <StickerFrame {...props}>
      <path
        d="M10 52V31C10 17 19 9 32 9S54 17 54 31V52Z"
        fill="var(--white)"
      />
      <path
        d="M14 24C18 13 28 10 41 13L49 23Z"
        fill="var(--blue)"
        stroke="none"
      />
      <ellipse
        cx="25"
        cy="33"
        rx="3"
        ry="5"
        fill="var(--ink)"
        stroke="none"
      />
      <ellipse
        cx="40"
        cy="33"
        rx="3"
        ry="5"
        fill="var(--ink)"
        stroke="none"
      />
      <path
        d="M9 51H55"
        stroke="var(--blue)"
        strokeWidth="6"
      />
    </StickerFrame>
  );
}

function BeretSticker({ tone, ...props }) {
  const fill = tone === "red" ? "var(--red)" : "var(--blue)";

  return (
    <StickerFrame {...props}>
      <path
        d="M8 39C6 25 17 16 33 16C47 16 57 25 56 37C45 44 21 45 8 39Z"
        fill={fill}
      />
      <path
        d="M16 42C28 46 43 45 51 40L49 48C37 53 25 52 17 48Z"
        fill={fill}
      />
      <path
        d="M32 17L36 9"
        stroke={fill}
        strokeWidth="6"
      />
      <path
        d="M17 31C20 25 26 23 32 23"
        stroke="var(--white)"
        strokeWidth="3"
      />
    </StickerFrame>
  );
}

/* 2. Blue beret */

export function BlueBeretSticker(props) {
  return <BeretSticker {...props} tone="blue" />;
}

/* 3. Red beret */

export function RedBeretSticker(props) {
  return <BeretSticker {...props} tone="red" />;
}

/* 4. Striped fabric */

export function StripeSticker(props) {
  return (
    <StickerFrame {...props}>
      <path
        d="M15 10L30 15L48 10L55 48L36 55L10 47Z"
        fill="var(--white)"
      />
      <path
        d="M15 19L31 23L49 18L50 25L31 30L14 26Z"
        fill="var(--blue)"
        stroke="none"
      />
      <path
        d="M13 33L32 37L52 31L53 38L33 44L12 40Z"
        fill="var(--blue)"
        stroke="none"
      />
      <path
        d="M12 46L35 50L54 44L55 48L36 55L10 47Z"
        fill="var(--blue)"
        stroke="none"
      />
    </StickerFrame>
  );
}

/* 5. Rose */

export function RoseSticker(props) {
  return (
    <StickerFrame {...props}>
      <path
        d="M32 31C32 41 30 49 24 57"
        stroke="var(--blue)"
        strokeWidth="6"
      />
      <path
        d="M30 44C20 44 15 39 13 33C23 33 29 37 30 44Z"
        fill="var(--blue)"
      />
      <path
        d="M31 40C38 33 45 32 51 34C47 42 40 45 31 45Z"
        fill="var(--blue)"
      />
      <path
        d="M32 8C40 3 49 8 48 16C57 18 56 29 48 33C44 42 32 42 28 36C17 39 10 31 14 23C7 15 16 7 24 11C26 7 29 6 32 8Z"
        fill="var(--red)"
      />
      <path
        d="M25 19C30 14 39 16 41 22C42 28 34 33 28 29C23 27 22 23 25 19Z"
        fill="var(--white)"
        stroke="none"
      />
      <path
        d="M28 23C31 20 36 21 36 25C35 28 30 28 28 25"
        stroke="var(--white)"
        strokeWidth="2"
      />
    </StickerFrame>
  );
}

/* 6. Petal */

export function PetalSticker(props) {
  return (
    <StickerFrame {...props}>
      <path
        d="M16 15C25 5 44 8 50 22C56 37 43 50 23 55C24 42 8 29 16 15Z"
        fill="var(--red)"
      />
      <path
        d="M23 19C27 15 34 15 38 18"
        stroke="var(--white)"
        strokeWidth="3"
      />
    </StickerFrame>
  );
}

/* 7. Water drop */

export function WaterSticker(props) {
  return (
    <StickerFrame {...props}>
      <path
        d="M32 6C27 17 12 29 12 41C12 52 21 58 32 58S52 52 52 41C52 29 38 17 32 6Z"
        fill="var(--blue)"
      />
      <path
        d="M24 31C20 36 19 42 22 46"
        stroke="var(--white)"
        strokeWidth="4"
      />
    </StickerFrame>
  );
}

/* 8. Flame */

export function FireSticker(props) {
  return (
    <StickerFrame {...props}>
      <path
        d="M35 6C37 18 50 21 51 35C53 48 44 58 31 58C18 58 10 49 12 37C13 30 19 25 20 18C25 22 27 28 26 32C34 25 36 17 35 6Z"
        fill="var(--red)"
      />
      <path
        d="M33 31C35 39 42 40 41 47C40 53 34 56 29 53C22 49 25 40 33 31Z"
        fill="var(--white)"
        stroke="none"
      />
    </StickerFrame>
  );
}

/* 9. Chick face motif */

export function PipiroSticker(props) {
  return (
    <StickerFrame {...props}>
      <path
        d="M28 16L24 8L34 13L40 8L39 17"
        fill="var(--red)"
      />
      <path
        d="M9 36C9 22 18 15 32 15S55 22 55 36S46 56 32 56S9 50 9 36Z"
        fill="var(--white)"
      />
      <circle
        cx="24"
        cy="34"
        r="3"
        fill="var(--ink)"
        stroke="none"
      />
      <circle
        cx="41"
        cy="34"
        r="3"
        fill="var(--ink)"
        stroke="none"
      />
      <path
        d="M27 41L33 37L39 41L33 46Z"
        fill="var(--red)"
        stroke="none"
      />
    </StickerFrame>
  );
}

/* 10. Chick footprint */

export function FootprintSticker(props) {
  return (
    <StickerFrame {...props}>
      <path
        d="M26 34L19 18C18 15 20 12 23 13L30 28L29 10C29 6 35 6 35 10L36 28L43 15C45 12 50 15 48 19L40 36L39 49C38 55 28 57 25 51C23 47 24 39 26 34Z"
        fill="currentColor"
      />
    </StickerFrame>
  );
}

/* 11. Five-point star */

export function StarSticker(props) {
  return (
    <StickerFrame {...props}>
      <path
        d="M32 5L40 22L59 25L45 38L48 58L32 48L16 58L19 38L5 25L24 22Z"
        fill="var(--red)"
      />
    </StickerFrame>
  );
}

/* 12. Four-point sparkle */

export function SparkleSticker(props) {
  return (
    <StickerFrame {...props}>
      <path
        d="M32 5L40 24L59 32L40 40L32 59L24 40L5 32L24 24Z"
        fill="var(--blue)"
      />
      <path
        d="M32 21L36 28L43 32L36 36L32 43L28 36L21 32L28 28Z"
        fill="var(--white)"
        stroke="none"
      />
    </StickerFrame>
  );
}

/* 13. Speech bubble */

export function SpeechSticker(props) {
  return (
    <StickerFrame {...props}>
      <path
        d="M10 13H54V43H35L21 56L23 43H10Z"
        fill="var(--white)"
      />
      <path
        d="M32 21V30"
        stroke="var(--ink)"
        strokeWidth="5"
      />
      <circle
        cx="32"
        cy="37"
        r="2.5"
        fill="var(--ink)"
        stroke="none"
      />
    </StickerFrame>
  );
}

/* 14. Stage curtain */

export function CurtainSticker(props) {
  return (
    <StickerFrame {...props}>
      <path
        d="M8 10H56V20H8Z"
        fill="var(--blue)"
      />
      <path
        d="M10 19H29C27 31 21 38 14 41L21 56H9Z"
        fill="var(--red)"
      />
      <path
        d="M35 19H54L55 56H43L50 41C43 38 37 31 35 19Z"
        fill="var(--red)"
      />
      <path
        d="M12 40L20 37"
        stroke="var(--white)"
        strokeWidth="5"
      />
      <path
        d="M44 37L52 40"
        stroke="var(--white)"
        strokeWidth="5"
      />
      <path
        d="M18 21C18 28 16 33 13 36"
        stroke="var(--ink)"
        strokeWidth="3"
      />
      <path
        d="M46 21C46 28 48 33 51 36"
        stroke="var(--ink)"
        strokeWidth="3"
      />
    </StickerFrame>
  );
}

/* 15. White glove */

export function GloveSticker(props) {
  return (
    <StickerFrame {...props}>
      <path
        d="M20 53L17 39L10 31C7 27 11 22 15 25L21 30L18 14C17 9 23 8 25 13L28 27L28 9C28 4 34 4 35 9L36 27L40 12C41 7 47 9 46 14L43 30L48 21C51 17 56 21 53 26L48 39L45 53Z"
        fill="var(--white)"
      />
      <path
        d="M20 49H45L44 57H21Z"
        fill="var(--blue)"
      />
      <path
        d="M27 31L29 40"
        stroke="var(--blue)"
        strokeWidth="2"
      />
      <path
        d="M35 31L35 40"
        stroke="var(--blue)"
        strokeWidth="2"
      />
      <path
        d="M42 33L40 41"
        stroke="var(--blue)"
        strokeWidth="2"
      />
    </StickerFrame>
  );
}

/* 16. Selection stamp */

export function StampSticker(props) {
  return (
    <StickerFrame {...props}>
      <path
        d="M32 5L39 10L48 9L51 18L59 23L56 32L59 41L51 46L48 55L39 54L32 59L25 54L16 55L13 46L5 41L8 32L5 23L13 18L16 9L25 10Z"
        fill="var(--white)"
      />
      <path
        d="M20 32L28 40L44 23"
        stroke="currentColor"
        strokeWidth="6"
        fill="none"
      />
    </StickerFrame>
  );
}

/* Decorative separator between question groups */

export function StickerRow() {
  return (
    <div className="sticker-row" aria-hidden="true">
      <StarSticker size="sm" tilt="left" />
      <RoseSticker size="md" tilt="right" />
      <StarSticker size="sm" tilt="right" />
    </div>
  );
}

/* Hero-to-page separator */

export function WaveDivider() {
  return (
    <svg
      className="wave-divider"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 80"
      width="1440"
      height="80"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 32C120 8 240 8 360 32S600 56 720 32S960 8 1080 32S1320 56 1440 32V80H0Z"
        fill="currentColor"
      />
    </svg>
  );
}
