import {
  useId,
  useLayoutEffect,
  useRef,
  useState
} from "react";

import { createPortal } from "react-dom";

let pageLockCount = 0;
let pageSnapshot = null;

const lockedProperties = [
  "position",
  "top",
  "left",
  "width",
  "overflow",
  "padding-right"
];

function lockPage() {
  if (pageLockCount === 0) {
    const body = document.body;
    const scrollbarWidth = Math.max(
      0,
      window.innerWidth - document.documentElement.clientWidth
    );

    pageSnapshot = {
      x: window.scrollX,
      y: window.scrollY,
      styles: lockedProperties.map((name) => ({
        name,
        value: body.style.getPropertyValue(name),
        priority: body.style.getPropertyPriority(name)
      }))
    };

    const currentPadding =
      Number.parseFloat(
        window.getComputedStyle(body).paddingRight
      ) || 0;

    body.style.setProperty("position", "fixed");
    body.style.setProperty("top", `${-pageSnapshot.y}px`);
    body.style.setProperty("left", `${-pageSnapshot.x}px`);
    body.style.setProperty("width", "100%");
    body.style.setProperty("overflow", "hidden");

    if (scrollbarWidth > 0) {
      body.style.setProperty(
        "padding-right",
        `${currentPadding + scrollbarWidth}px`
      );
    }
  }

  pageLockCount += 1;
  let released = false;

  return function unlockPage() {
    if (released) return;
    released = true;

    pageLockCount -= 1;

    if (pageLockCount !== 0 || !pageSnapshot) {
      return;
    }

    const snapshot = pageSnapshot;
    pageSnapshot = null;

    for (const property of snapshot.styles) {
      if (property.value) {
        document.body.style.setProperty(
          property.name,
          property.value,
          property.priority
        );
      } else {
        document.body.style.removeProperty(property.name);
      }
    }

    const root = document.documentElement;
    const behavior = root.style.getPropertyValue(
      "scroll-behavior"
    );
    const priority = root.style.getPropertyPriority(
      "scroll-behavior"
    );

    root.style.setProperty(
      "scroll-behavior",
      "auto",
      "important"
    );

    window.scrollTo(snapshot.x, snapshot.y);

    if (behavior) {
      root.style.setProperty(
        "scroll-behavior",
        behavior,
        priority
      );
    } else {
      root.style.removeProperty("scroll-behavior");
    }
  };
}

function isOutside(dialog, event) {
  const rectangle = dialog.getBoundingClientRect();

  return (
    event.clientX < rectangle.left ||
    event.clientX > rectangle.right ||
    event.clientY < rectangle.top ||
    event.clientY > rectangle.bottom
  );
}

export default function Sheet({
  id,
  open,
  onClose,
  title,
  className = "",
  children
}) {
  const generatedId = useId();
  const dialogId = id || `sheet-${generatedId}`;
  const titleId = `${dialogId}-title`;

  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  const outsidePointerRef = useRef(false);
  const missingCloseWarningRef = useRef(false);

  const [failure, setFailure] = useState("");

  useLayoutEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  function requestClose() {
    if (typeof closeRef.current === "function") {
      closeRef.current();
      return;
    }

    if (!missingCloseWarningRef.current) {
      missingCloseWarningRef.current = true;

      console.warn(
        "[Sheet] onClose 연결이 없습니다. " +
          "시트를 사용하는 컴포넌트의 닫기 함수를 연결해 주세요."
      );
    }

    dialogRef.current?.close();
  }

  useLayoutEffect(() => {
    if (!open) return undefined;

    const dialog = dialogRef.current;

    if (!dialog || typeof dialog.showModal !== "function") {
      console.warn(
        "[Sheet] HTML dialog를 열 수 없습니다. " +
          "dialog 연결과 브라우저 지원 여부를 확인해 주세요."
      );

      setFailure(
        "상세 화면 열람에 실패함. 브라우저 확인 필요함."
      );

      if (typeof closeRef.current === "function") {
        closeRef.current();
      }

      return undefined;
    }

    setFailure("");
    outsidePointerRef.current = false;

    const unlock = lockPage();

    try {
      dialog.showModal();
    } catch (error) {
      unlock();

      console.warn(
        "[Sheet] 상세 화면을 여는 중 오류가 발생했습니다.",
        error
      );

      setFailure(
        "상세 화면 열람 실패 상태임. 다시 시도 필요함."
      );

      if (typeof closeRef.current === "function") {
        closeRef.current();
      }

      return undefined;
    }

    return () => {
      try {
        if (dialog.open) {
          dialog.close();
        }
      } finally {
        unlock();
      }
    };
  }, [open]);

  return (
    <>
      {failure && (
        <p className="ios-inline-error" role="alert">
          {failure}
        </p>
      )}

      {createPortal(
        <dialog
          ref={dialogRef}
          id={dialogId}
          className={`ios-sheet ${className}`}
          aria-labelledby={titleId}
          onCancel={(event) => {
            event.preventDefault();
            requestClose();
          }}
          onPointerDown={(event) => {
            outsidePointerRef.current =
              event.target === event.currentTarget &&
              isOutside(event.currentTarget, event);
          }}
          onPointerUp={(event) => {
            const shouldClose =
              outsidePointerRef.current &&
              event.target === event.currentTarget &&
              isOutside(event.currentTarget, event);

            outsidePointerRef.current = false;

            if (shouldClose) {
              requestClose();
            }
          }}
          onPointerCancel={() => {
            outsidePointerRef.current = false;
          }}
        >
          <div
            className="ios-sheet-handle"
            aria-hidden="true"
          />

          <div className="ios-sheet-heading">
            <h2
              id={titleId}
              className="ios-sheet-title"
              tabIndex={-1}
            >
              {title}
            </h2>

            <button
              type="button"
              className="ios-sheet-close"
              aria-label="상세 화면 종료"
              onClick={requestClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="m6 6 12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="ios-sheet-content">
            {children}
          </div>
        </dialog>,
        document.body
      )}
    </>
  );
}
