import { useEffect, useRef, useState } from "react";

/*
 * 영상 직접 재생(v37). 영상 파일을 사이트에 넣어 두고 video 요소로 재생함.
 * 시청 기록은 기존과 같은 판정식(250ms 표본, 탭 가림, 화면 50% 이상, 속도 변화 제외)으로 tracker에 전달함.
 */
const base = import.meta.env.BASE_URL || "./";

export default function PxVideo({ video, tracker }) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");

  const src = `${base}video/${video.id}.mp4`;
  const poster = `${base}video/${video.id}.jpg`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let previous = null;
    let inView = false;
    let loggedLoad = false;

    const record = (method, ...args) => {
      try {
        tracker?.[method]?.(...args);
      } catch (caught) {
        console.warn(`[PxVideo] ${method} 기록 실패`, caught);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = Boolean(entry && entry.isIntersecting && entry.intersectionRatio >= 0.5);
        if (inView && el.paused && !el.ended && !el.dataset.userPaused) {
          el.muted = true;
          const tried = el.play();
          if (tried && tried.catch) tried.catch(() => {});
        } else if (!inView && !el.paused) {
          el.pause();
        }
      },
      { threshold: [0, 0.5] }
    );
    observer.observe(el);

    function onLoaded() {
      if (!el.dataset.started && video.startAt) {
        el.dataset.started = "1";
        try {
          el.currentTime = video.startAt;
        } catch {
          /* 시작 위치를 못 맞추면 처음부터 재생 */
        }
      }
      if (loggedLoad) return;
      loggedLoad = true;
      record("videoLoaded", video.id);
    }
    function onError() {
      record("videoError", video.id, el.error?.code || "media");
      setError("영상을 불러오지 못했어요. 화면을 새로 고쳐 보시고, 그래도 안 되면 \"영상을 보지 못했어요\"를 골라 주세요.");
    }
    function reset() {
      previous = null;
    }
    function onPauseEvent() {
      previous = null;
      if (inView && !document.hidden) el.dataset.userPaused = "1";
    }
    function onPlayEvent() {
      delete el.dataset.userPaused;
    }
    function sample() {
      const playing = !el.paused && !el.ended && el.readyState >= 2;
      const current = {
        clock: performance.now(),
        media: el.currentTime,
        playing,
        rate: el.playbackRate || 1,
        visible: !document.hidden,
        inView
      };
      if (previous) {
        const elapsed = (current.clock - previous.clock) / 1000;
        const mediaDelta = current.media - previous.media;
        const stableRate = Math.abs(current.rate - previous.rate) < 0.01;
        const expected = elapsed * current.rate;
        const plausible =
          elapsed > 0 && elapsed <= 1.2 && mediaDelta > 0 && Math.abs(mediaDelta - expected) <= 0.35;
        if (previous.playing && current.playing && previous.visible && current.visible && stableRate && plausible) {
          const counted = Math.min(mediaDelta, expected);
          record("addVideoPlayback", video.id, counted, counted / current.rate, previous.inView && current.inView);
        }
      }
      previous = current;
    }
    function onVisibility() {
      previous = null;
      if (document.hidden) el.pause();
    }

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("error", onError);
    el.addEventListener("seeking", reset);
    el.addEventListener("ratechange", reset);
    el.addEventListener("pause", onPauseEvent);
    el.addEventListener("play", onPlayEvent);
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(sample, 250);
    if (el.readyState >= 1) onLoaded();

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("error", onError);
      el.removeEventListener("seeking", reset);
      el.removeEventListener("ratechange", reset);
      el.removeEventListener("pause", onPauseEvent);
      el.removeEventListener("play", onPlayEvent);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [tracker, video]);

  return (
    <article
      id={video.anchor}
      className={`px-video tone-${video.tone}`}
      data-track-section={`video-${video.key}`}
      aria-labelledby={`${video.key}-title`}
    >
      <div className="px-video-head">
        <h4 id={`${video.key}-title`} className="px-video-title">
          {video.title}
        </h4>
      </div>
      <div className="px-video-frame">
        <video
          ref={ref}
          className="px-video-player"
          src={src}
          poster={poster}
          controls
          muted
          playsInline
          preload="metadata"
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          title={video.title}
          onPlay={() => setStarted(true)}
        />
      </div>
      {error && (
        <p className="px-video-error" role="status">
          {error}
        </p>
      )}
    </article>
  );
}
