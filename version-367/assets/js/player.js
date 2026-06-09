function initMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var overlay = document.getElementById(options.overlayId);
  var attached = false;
  var hls = null;

  if (!video || !overlay || !options.src) {
    return;
  }

  function attachMedia() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = options.src;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(options.src);
      hls.attachMedia(video);
      return;
    }

    video.src = options.src;
  }

  function playVideo() {
    attachMedia();
    overlay.classList.add('is-hidden');
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', playVideo);

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });

  video.addEventListener('pause', function () {
    if (!video.ended) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
