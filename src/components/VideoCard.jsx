import {
  useEffect,
  useRef,
  useState
} from "react";

import { loadYouTubeAPI } from "../lib/youtube.js";
import { Artwork } from "./CollectCard.jsx";
import { WaveDivider } from "./Stickers.jsx";
import Sheet from "./Sheet.jsx";

function PlaySymbol() {
  return (
    <svg
      className="play-symbol"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="32"
      height="32"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M11 6L26 16L11 26Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function VideoCard({ video, tracker }) {
  const mountRef = useRef(null);
  const openRef = useRef(false);
  const playbackControlsRef = useRef(null);
  const trackingWarningsRef = useRef(new Set());
  const observerWarningRef = useRef(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const sheetId = `${video.anchor}-sheet`;

  useEffect(() => {
    if (!requested) return undefined;

    const mount = mountRef.current;

    if (!mount) {
      console.warn(
        "[VideoCard] 영상 마운트 요소가 없습니다. " +
          "video-frame의 mountRef 연결을 확인해 주세요."
      );

      setError(
        "영상 연결 실패로 재연결 필요"
      );

      return undefined;
    }

    let disposed = false;
    let player = null;
    let timer = null;
    let previous = null;
    let inView = false;
    let samplingFailed = false;
    let observer = null;

    setReady(false);
    setError("");
    setIsPlaying(false);

    function record(method, ...args) {
      try {
        if (typeof tracker?.[method] !== "function") {
          throw new Error(
            `tracker.${method} 연결이 없습니다.`
          );
        }

        tracker[method](...args);
      } catch (caught) {
        const key = `${video.id}:${method}`;

        if (!trackingWarningsRef.current.has(key)) {
          trackingWarningsRef.current.add(key);

          console.warn(
            `[VideoCard] ${method} 기록에 실패했습니다. ` +
              "VideoCard에 전달하는 tracker를 확인해 주세요.",
            caught
          );
        }
      }
    }

    function clearTimer() {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function removePlayer() {
      const currentPlayer = player;
      player = null;

      try {
        currentPlayer?.destroy();
      } catch (caught) {
        console.warn(
          "[VideoCard] 플레이어 정리에 실패해 " +
            "영상 요소를 직접 제거합니다.",
          caught
        );
      } finally {
        mount.replaceChildren();
      }
    }

    /*
     * 정상적인 닫기는 일시정지만 합니다.
     * 플레이어를 유지하므로 시트를 다시 열어도 videoLoaded를
     * 다시 발생시키거나 재생 위치를 초기화하지 않습니다.
     */
    function pausePlayback() {
      previous = null;

      if (!player) return;

      try {
        player.pauseVideo();
      } catch {
        record("videoError", video.id, "pause");

        samplingFailed = true;
        clearTimer();
        removePlayer();

        if (!disposed) {
          setReady(false);
          setIsPlaying(false);

          setError(
            "영상 연결 중단으로 재연결 필요"
          );
        }
      }
    }

    const controls = {
      pause: pausePlayback,
      resetSample() {
        previous = null;
        inView = false;

        if (observer) {
          observer.unobserve(mount);
          observer.observe(mount);
        }
      }
    };

    playbackControlsRef.current = controls;

    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          inView = Boolean(
            openRef.current &&
              entry &&
              entry.isIntersecting &&
              entry.intersectionRatio >= 0.5
          );
        },
        { threshold: [0, 0.5] }
      );

      observer.observe(mount);
    } else if (!observerWarningRef.current) {
      observerWarningRef.current = true;

      console.warn(
        "[VideoCard] 화면 노출을 확인할 수 없어 inView는 " +
          "false로 유지합니다. 지원 브라우저를 확인해 주세요."
      );
    }

    function sample() {
      if (
        disposed ||
        !player ||
        samplingFailed
      ) {
        return;
      }

      /*
       * 닫힌 시트의 시간은 샘플 사이에 연결하지 않습니다.
       * 아래 재생 판정식과 tracker 인수는 v3와 같습니다.
       */
      if (!openRef.current) {
        previous = null;
        return;
      }

      try {
        const current = {
          clock: performance.now(),
          media: player.getCurrentTime(),
          state: player.getPlayerState(),
          rate: player.getPlaybackRate() || 1,
          visible: !document.hidden,
          inView
        };

        if (previous) {
          const elapsed =
            (current.clock - previous.clock) / 1000;

          const mediaDelta =
            current.media - previous.media;

          const stableRate =
            Math.abs(
              current.rate - previous.rate
            ) < 0.01;

          const expected =
            elapsed * current.rate;

          const plausiblePlayback =
            elapsed > 0 &&
            elapsed <= 1.2 &&
            mediaDelta > 0 &&
            Math.abs(
              mediaDelta - expected
            ) <= 0.35;

          if (
            previous.state === 1 &&
            current.state === 1 &&
            previous.visible &&
            current.visible &&
            stableRate &&
            plausiblePlayback
          ) {
            const countedMedia = Math.min(
              mediaDelta,
              expected
            );

            record(
              "addVideoPlayback",
              video.id,
              countedMedia,
              countedMedia / current.rate,
              previous.inView && current.inView
            );
          }
        }

        previous = current;
      } catch {
        samplingFailed = true;

        record(
          "videoError",
          video.id,
          "sampling"
        );

        clearTimer();
        pausePlayback();

        if (!disposed) {
          setError(
            "재생 시간 기록 실패 상태임. 영상 재연결이나 보지 못했다는 답변 선택도 가능함."
          );

          setIsPlaying(false);
        }
      }
    }

    function visibilityChanged() {
      previous = null;

      if (document.hidden) {
        setIsPlaying(false);
        pausePlayback();
      }
    }

    document.addEventListener(
      "visibilitychange",
      visibilityChanged
    );

    loadYouTubeAPI()
      .then((YT) => {
        if (disposed) return;

        const target = document.createElement("div");
        mount.replaceChildren(target);

        player = new YT.Player(target, {
          width: "100%",
          height: "100%",
          videoId: video.id,

          playerVars: {
            origin: window.location.origin,
            playsinline: 1,
            controls: 1,
            rel: 0
          },

          events: {
            onReady(event) {
              if (disposed) return;

              const iframe = event.target.getIframe();

              if (iframe) {
                iframe.setAttribute(
                  "title",
                  video.title
                );
              } else {
                console.warn(
                  "[VideoCard] 플레이어 iframe을 " +
                    "확인하지 못했습니다."
                );
              }

              record("videoLoaded", video.id);
              setReady(true);

              timer = window.setInterval(
                sample,
                250
              );

              if (!openRef.current) {
                pausePlayback();
              }
            },

            onStateChange(event) {
              if (disposed) return;

              if (
                !openRef.current &&
                event.data === 1
              ) {
                setIsPlaying(false);
                pausePlayback();
                return;
              }

              setIsPlaying(
                event.data === 1 &&
                  openRef.current &&
                  !document.hidden
              );

              sample();
            },

            onPlaybackRateChange() {
              previous = null;
            },

            onError(event) {
              if (disposed) return;

              record(
                "videoError",
                video.id,
                event.data
              );

              clearTimer();
              pausePlayback();

              setError(
                "이 페이지에서 영상 재생 불가임. 재연결 또는 아래 링크 이용 필요"
              );

              setIsPlaying(false);
              previous = null;
            }
          }
        });
      })
      .catch((caught) => {
        if (disposed) return;

        record(
          "videoError",
          video.id,
          "api-load"
        );

        setError(
          caught?.message ||
            "영상 연결 실패로 재연결 필요"
        );

        setIsPlaying(false);
      });

    return () => {
      disposed = true;

      observer?.disconnect();

      document.removeEventListener(
        "visibilitychange",
        visibilityChanged
      );

      clearTimer();
      removePlayer();

      if (
        playbackControlsRef.current === controls
      ) {
        playbackControlsRef.current = null;
      }
    };
  }, [
    requested,
    attempt,
    tracker,
    video
  ]);

  function openVideo() {
    openRef.current = true;
    setSheetOpen(true);

    playbackControlsRef.current?.resetSample();

    if (!requested) {
      setError("");
      setRequested(true);
      setAttempt((value) => value + 1);
    }
  }

  function closeVideo() {
    openRef.current = false;

    playbackControlsRef.current?.pause();

    setIsPlaying(false);
    setSheetOpen(false);
  }

  function requestVideo() {
    openRef.current = true;

    setSheetOpen(true);
    setError("");
    setReady(false);
    setIsPlaying(false);
    setRequested(true);
    setAttempt((value) => value + 1);
  }

  const stageOpen =
    requested && ready && !error;

  const activeCharacter =
    video.character ||
    (
      video.key === "water"
        ? "maero_blue"
        : "maero_red"
    );

  const guideCharacter =
    isPlaying && !error
      ? activeCharacter
      : "maero_basic";

  const scene =
    video.scene ||
    (
      video.key === "water"
        ? "scene_water.jpg"
        : "scene_fire.jpg"
    );

  const sheetClassName = [
    "ios-video-sheet",
    `tone-${video.tone}`,
    isPlaying && !error ? "is-playing" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      id={video.anchor}
      className={[
        "video-card",
        `tone-${video.tone}`,
        isPlaying && !error
          ? "is-playing"
          : ""
      ]
        .filter(Boolean)
        .join(" ")}
      data-track-section={`video-${video.key}`}
      aria-labelledby={`${video.key}-title`}
    >
      <div className="video-card-heading">
        <div>
          <p className="eyebrow">
            축제의 장면
          </p>

          <h3 id={`${video.key}-title`}>
            {video.title}
          </h3>

          <p>{video.description}</p>
        </div>

        <div
          className="video-guide"
          aria-hidden="true"
        >
          <Artwork
            file={`img/3d_${guideCharacter}.png`}
            fallbackFile={`img/${guideCharacter}.png`}
          />
        </div>
      </div>

      {stageOpen ? (
        <div className="ios-video-reopen">
          <button
            type="button"
            className="ios-video-open"
            aria-controls={sheetId}
            aria-expanded={sheetOpen}
            onClick={openVideo}
          >
            <PlaySymbol />
            영상 재열람
          </button>
        </div>
      ) : (
        <div className="ios-video-preview">
          <Artwork
            file={`img/${scene}`}
            className="ios-video-preview-scene"
            width={1500}
            height={1000}
          />

          <div
            className="ios-video-preview-character"
            aria-hidden="true"
          >
            <Artwork
              file="img/3d_maero_basic.png"
              fallbackFile="img/maero_basic.png"
            />
          </div>

          <button
            type="button"
            className="ios-video-open"
            aria-controls={sheetId}
            aria-expanded={sheetOpen}
            onClick={openVideo}
          >
            <PlaySymbol />
            영상 연결
          </button>
        </div>
      )}

      <div className="video-card-footer">
        <a
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          YouTube에서 별도 시청
        </a>

        <p className="helper">
          외부에서 시청한 시간은 이 설문의 재생 시간에서
          제외함.
        </p>
      </div>

      <Sheet
        id={sheetId}
        open={sheetOpen}
        onClose={closeVideo}
        title={video.title}
        className={sheetClassName}
      >
        <div className="ios-video-summary">
          <p>{video.description}</p>

          <Artwork
            file={`img/3d_${guideCharacter}.png`}
            fallbackFile={`img/${guideCharacter}.png`}
          />
        </div>

        <div
          className="theater-stage"
          data-open={stageOpen ? "true" : "false"}
        >
          <div
            ref={mountRef}
            className={`video-frame ${
              !requested || error
                ? "is-hidden"
                : ""
            }`}
          />

          {!stageOpen && (
            <div className="video-cover">
              <Artwork
                file={`img/${scene}`}
                className="video-poster-scene"
                width={1500}
                height={1000}
              />

              <div
                className="video-poster-character"
                aria-hidden="true"
              >
                <Artwork
                  file="img/3d_maero_basic.png"
                  fallbackFile="img/maero_basic.png"
                />
              </div>

              <div className="video-cover-copy">
                {requested && !error ? (
                  <p role="status">
                    영상 연결 중
                  </p>
                ) : (
                  <p>
                    이 페이지에서 영상 시청
                  </p>
                )}

                <p className="helper">
                  YouTube 연결 후 재생 버튼
                  선택 필요
                </p>

                <p className="scene-note"></p>
              </div>
            </div>
          )}

          <div
            className="theater-curtain theater-curtain-left"
            aria-hidden="true"
          />

          <div
            className="theater-curtain theater-curtain-right"
            aria-hidden="true"
          />
        </div>

        <div
          className="video-wave"
          aria-hidden="true"
        >
          <WaveDivider />
        </div>

        {error && (
          <div
            className="video-error"
            role="status"
          >
            <p>{error}</p>

            <button
              type="button"
              className="button button-white"
              onClick={requestVideo}
            >
              영상 재연결
            </button>
          </div>
        )}

        <div className="video-card-footer">
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube에서 별도 시청
          </a>

          <p className="helper">
            외부에서 시청한 시간은 이 설문의 재생 시간에서
            제외함.
          </p>
        </div>
      </Sheet>
    </article>
  );
}