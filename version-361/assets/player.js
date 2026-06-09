(function () {
  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.onload = callback;
    document.head.appendChild(script);
  }

  function bindPlayer(shell) {
    var video = shell.querySelector('.player-video');
    var button = shell.querySelector('.player-start');
    var sourceUrl = shell.getAttribute('data-video');
    var started = false;

    function start() {
      if (!video || !sourceUrl) {
        return;
      }

      shell.classList.add('is-playing');

      if (started) {
        video.play();
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        video.play();
        return;
      }

      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play();
          });
        } else {
          video.src = sourceUrl;
          video.play();
        }
      });
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started || video.paused) {
          start();
        }
      });
    }
  }

  document.querySelectorAll('.player-shell').forEach(bindPlayer);
})();
