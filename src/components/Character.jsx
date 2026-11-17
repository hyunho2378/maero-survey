import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";

import { publicAsset } from "../config.js";

const MotionContext = createContext(null);

const names = {
  maero_basic: "처음의 마에로",
  maero_blue: "물을 지난 마에로",
  maero_red: "불을 지난 마에로",
  pipiro: "삐삐로"
};

const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value));

export function MotionProvider({ children }) {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
  );

  const [enabled, setEnabled] = useState(false);
  const [angle, setAngle] = useState({ x: 0, y: 0 });
  const [message, setMessage] = useState("");
  const frame = useRef(null);

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const changed = () => {
      setReduced(media.matches);

      if (media.matches) {
        setEnabled(false);
        setAngle({ x: 0, y: 0 });
      }
    };

    media.addEventListener("change", changed);
    return () => media.removeEventListener("change", changed);
  }, []);

  useEffect(() => {
    if (!enabled || reduced) return undefined;

    let latest = { x: 0, y: 0 };

    function handleOrientation(event) {
      if (
        !Number.isFinite(event.beta) ||
        !Number.isFinite(event.gamma)
      ) {
        return;
      }

      latest = {
        x: clamp((event.beta - 25) / 8, -5, 5),
        y: clamp(event.gamma / 7, -5, 5)
      };

      if (frame.current !== null) return;

      frame.current = requestAnimationFrame(() => {
        setAngle(latest);
        frame.current = null;
      });
    }

    window.addEventListener(
      "deviceorientation",
      handleOrientation
    );

    return () => {
      window.removeEventListener(
        "deviceorientation",
        handleOrientation
      );

      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    };
  }, [enabled, reduced]);

  async function toggle() {
    if (enabled) {
      setEnabled(false);
      setAngle({ x: 0, y: 0 });
      setMessage("기기 기울임을 해제함.");
      return;
    }

    if (reduced) {
      setMessage("움직임 줄이기 설정 적용 중임.");
      return;
    }

    if (
      !window.isSecureContext ||
      !window.DeviceOrientationEvent
    ) {
      setMessage(
        "이 환경에서는 기기 기울임 사용 불가함. 기울임 없이 설문 이용 가능함."
      );
      return;
    }

    try {
      const requestPermission =
        window.DeviceOrientationEvent.requestPermission;

      if (typeof requestPermission === "function") {
        const permission = await requestPermission.call(
          window.DeviceOrientationEvent
        );

        if (permission !== "granted") {
          setMessage(
            "권한 없이도 축제와 설문 열람 가능함."
          );
          return;
        }
      }

      setEnabled(true);
      setMessage("3D 그림의 기기 기울임을 활성화함.");
    } catch {
      setMessage(
        "기울임 활성화 실패 상태임. 설문은 계속 진행 가능함."
      );
    }
  }

  return (
    <MotionContext.Provider
      value={{
        reduced,
        enabled,
        angle,
        message,
        toggle
      }}
    >
      {children}
    </MotionContext.Provider>
  );
}

export function MotionButton() {
  const motion = useContext(MotionContext);

  if (!motion) return null;

  return (
    <div className="motion-control">
      <button
        type="button"
        className="button button-light"
        onClick={motion.toggle}
        disabled={motion.reduced}
      >
        {motion.enabled
          ? "기기 기울임 해제"
          : "3D 기기 기울임 사용"}
      </button>

      <p className="helper" role="status">
        {motion.reduced
          ? "움직임 줄이기 설정 적용 중임."
          : motion.message ||
            "3D 그림 표시 시에만 약하게 움직임."}
      </p>
    </div>
  );
}

export default function Character({
  name,
  prefer3d = true,
  compact = false,
  eager = false,
  decorative = false
}) {
  const motion = useContext(MotionContext);
  const [stage, setStage] = useState(prefer3d ? 0 : 1);
  const [pointer, setPointer] = useState({
    active: false,
    x: 0,
    y: 0
  });

  useEffect(() => {
    setStage(prefer3d ? 0 : 1);
  }, [name, prefer3d]);

  const title = names[name] || "캐릭터";
  const canTilt = stage === 0 && !motion?.reduced && !compact;

  const activeAngle = pointer.active
    ? pointer
    : motion?.enabled
      ? motion.angle
      : { x: 0, y: 0 };

  const transform = canTilt
    ? `rotateX(${activeAngle.x}deg) rotateY(${activeAngle.y}deg)`
    : "none";

  function move(event) {
    if (!canTilt || event.pointerType !== "mouse") return;

    const rect = event.currentTarget.getBoundingClientRect();

    setPointer({
      active: true,
      x: clamp(
        ((event.clientY - rect.top) / rect.height - 0.5) * -10,
        -5,
        5
      ),
      y: clamp(
        ((event.clientX - rect.left) / rect.width - 0.5) * 10,
        -5,
        5
      )
    });
  }

  if (stage >= 2) {
    return (
      <div
        className={`character-fallback ${
          compact ? "is-compact" : ""
        }`}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : title}
        aria-hidden={decorative || undefined}
      >
        <span>{compact ? title.replace("처음의 ", "") : title}</span>

        {!compact && <span>그림 준비 중임.</span>}
      </div>
    );
  }

  const file =
    stage === 0
      ? publicAsset(`img/3d_${name}.png`)
      : publicAsset(`assets-img/${name}.png`);

  return (
    <div
      className={`character ${
        compact ? "is-compact" : ""
      }`}
      onPointerMove={move}
      onPointerLeave={() =>
        setPointer({ active: false, x: 0, y: 0 })
      }
    >
      <img
        src={file}
        alt={decorative ? "" : title}
        width="640"
        height="640"
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        style={{ transform }}
        onError={() => setStage((current) => current + 1)}
      />
    </div>
  );
}
