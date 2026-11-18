const VIDEO_IDS = ["ggng8MTKaH0", "LnEUYDxIkxk"];

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function campaignTag(value) {
  if (!value) return "";

  return /^[a-zA-Z0-9가-힣_.-]{1,64}$/.test(value)
    ? value
    : "redacted";
}

export function createTracker() {
  const startedAt = new Date().toISOString();
  const startedClock = performance.now();
  const query = new URLSearchParams(window.location.search);

  const acquisition = {
    utm_source: campaignTag(query.get("utm_source")),
    ref: campaignTag(query.get("ref"))
  };

  const viewportWidth = window.innerWidth;
  const sectionSeconds = {};
  const visibleSections = new Set();

  const videoRecords = Object.fromEntries(
    VIDEO_IDS.map((id) => [
      id,
      {
        loaded: false,
        playedSeconds: 0,
        wallSeconds: 0,
        visiblePlayedSeconds: 0,
        errors: []
      }
    ])
  );

  const viewedPhotos = new Set();
  const browsedPhotos = new Set();

  const infoByCard = {};

  let photoNavigationCount = 0;
  let infoOpenCount = 0;
  let running = false;
  let documentVisible = !document.hidden;
  let lastClock = performance.now();
  let observer = null;
  let interval = null;
  let frozen = null;

  function flush() {
    const now = performance.now();
    const seconds = Math.max(0, (now - lastClock) / 1000);

    if (running && documentVisible) {
      for (const id of visibleSections) {
        sectionSeconds[id] =
          (sectionSeconds[id] || 0) + seconds;
      }
    }

    lastClock = now;
  }

  function visibilityChanged() {
    flush();
    documentVisible = !document.hidden;
  }

  function pageHidden() {
    flush();
    documentVisible = false;
  }

  function pageShown() {
    lastClock = performance.now();
    documentVisible = !document.hidden;
  }

  function start() {
    if (running || frozen) return stop;

    running = true;
    documentVisible = !document.hidden;
    lastClock = performance.now();

    observer = new IntersectionObserver(
      (entries) => {
        flush();

        for (const entry of entries) {
          const id = entry.target.dataset.trackSection;

          if (!id) continue;

          if (
            entry.isIntersecting &&
            entry.intersectionRect.width > 0 &&
            entry.intersectionRect.height > 0
          ) {
            visibleSections.add(id);
          } else {
            visibleSections.delete(id);
          }
        }
      },
      { threshold: [0] }
    );

    document
      .querySelectorAll("[data-track-section]")
      .forEach((element) => {
        const id = element.dataset.trackSection;
        sectionSeconds[id] ??= 0;
        observer.observe(element);
      });

    interval = window.setInterval(flush, 1000);

    document.addEventListener(
      "visibilitychange",
      visibilityChanged
    );
    window.addEventListener("pagehide", pageHidden);
    window.addEventListener("pageshow", pageShown);

    return stop;
  }

  function stop() {
    flush();
    running = false;

    observer?.disconnect();
    observer = null;

    if (interval !== null) {
      window.clearInterval(interval);
      interval = null;
    }

    visibleSections.clear();

    document.removeEventListener(
      "visibilitychange",
      visibilityChanged
    );
    window.removeEventListener("pagehide", pageHidden);
    window.removeEventListener("pageshow", pageShown);
  }

  function buildSnapshot() {
    return {
      startedAt,
      totalSeconds: round(
        Math.max(0, (performance.now() - startedClock) / 1000)
      ),
      viewportWidth,
      acquisition: copy(acquisition),

      sectionVisibleSeconds: Object.fromEntries(
        Object.entries(sectionSeconds).map(([id, seconds]) => [
          id,
          round(seconds)
        ])
      ),

      videos: Object.fromEntries(
        Object.entries(videoRecords).map(([id, record]) => [
          id,
          {
            ...copy(record),
            playedSeconds: round(record.playedSeconds),
            wallSeconds: round(record.wallSeconds),
            visiblePlayedSeconds: round(
              record.visiblePlayedSeconds
            )
          }
        ])
      ),

      photos: {
        viewedIds: [...viewedPhotos],
        browsedIds: [...browsedPhotos],
        navigationCount: photoNavigationCount
      },

      info: {
        openCount: infoOpenCount,
        byCard: { ...infoByCard }
      }
    };
  }

  function snapshot() {
    if (frozen) return copy(frozen);

    flush();
    return buildSnapshot();
  }

  function finish() {
    if (!frozen) {
      stop();
      frozen = buildSnapshot();
    }

    return copy(frozen);
  }

  return {
    start,
    stop,
    snapshot,
    finish,

    videoLoaded(id) {
      if (frozen || !videoRecords[id]) return;
      videoRecords[id].loaded = true;
    },

    videoError(id, code) {
      if (frozen || !videoRecords[id]) return;

      const value = String(code).slice(0, 40);
      const errors = videoRecords[id].errors;

      if (!errors.includes(value)) errors.push(value);
    },

    addVideoPlayback(id, mediaSeconds, wallSeconds, inView) {
      if (
        frozen ||
        !videoRecords[id] ||
        !Number.isFinite(mediaSeconds) ||
        !Number.isFinite(wallSeconds) ||
        mediaSeconds <= 0 ||
        wallSeconds <= 0
      ) {
        return;
      }

      videoRecords[id].playedSeconds += mediaSeconds;
      videoRecords[id].wallSeconds += wallSeconds;

      if (inView) {
        videoRecords[id].visiblePlayedSeconds += mediaSeconds;
      }
    },

    photoNavigated() {
      if (!frozen) photoNavigationCount += 1;
    },

    photoViewed(id, browsed) {
      if (frozen || !id) return;

      viewedPhotos.add(id);

      if (browsed) browsedPhotos.add(id);
    },

    infoOpened(id) {
      if (frozen || !id) return;

      infoOpenCount += 1;
      infoByCard[id] = (infoByCard[id] || 0) + 1;
    }
  };
}
