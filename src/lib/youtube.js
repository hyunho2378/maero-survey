let apiPromise = null;

export function loadYouTubeAPI() {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve, reject) => {
    let settled = false;

    const oldScript = document.getElementById(
      "youtube-iframe-api"
    );

    oldScript?.remove();

    const script = document.createElement("script");
    script.id = "youtube-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;

    const timeout = window.setTimeout(() => {
      fail(new Error("영상 연결 지연"));
    }, 15000);

    function fail(error) {
      if (settled) return;

      settled = true;
      window.clearTimeout(timeout);
      script.remove();
      reject(error);
    }

    window.onYouTubeIframeAPIReady = () => {
      if (settled) return;

      if (!window.YT?.Player) {
        fail(new Error("영상 도구 불러오기 실패"));
        return;
      }

      settled = true;
      window.clearTimeout(timeout);
      resolve(window.YT);
    };

    script.onerror = () => {
      fail(new Error("YouTube 연결 실패"));
    };

    document.head.appendChild(script);
  }).catch((error) => {
    apiPromise = null;
    throw error;
  });

  return apiPromise;
}
