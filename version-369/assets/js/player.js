(function () {
    window.SitePlayer = {
        play: function (video, src) {
            if (!video || !src) {
                return Promise.resolve();
            }

            if (video.getAttribute("data-ready") === src) {
                return video.play().catch(function () {});
            }

            if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
                video.src = src;
                video.setAttribute("data-ready", src);
                return video.play().catch(function () {});
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (video._hlsInstance) {
                    video._hlsInstance.destroy();
                }

                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                video._hlsInstance = hls;
                hls.loadSource(src);
                hls.attachMedia(video);
                video.setAttribute("data-ready", src);

                return new Promise(function (resolve) {
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        video.play().then(resolve).catch(resolve);
                    });
                    hls.on(Hls.Events.ERROR, function () {
                        resolve();
                    });
                });
            }

            video.src = src;
            video.setAttribute("data-ready", src);
            return video.play().catch(function () {});
        }
    };
}());
