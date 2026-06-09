(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileNav() {
        var button = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", menu.classList.contains("is-open") ? "true" : "false");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var searchInput = scope.querySelector("[data-search]");
            var typeInput = scope.querySelector("[data-filter='type']");
            var regionInput = scope.querySelector("[data-filter='region']");
            var yearInput = scope.querySelector("[data-filter='year']");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }
            function apply() {
                var query = normalize(searchInput && searchInput.value);
                var type = normalize(typeInput && typeInput.value);
                var region = normalize(regionInput && regionInput.value);
                var year = normalize(yearInput && yearInput.value);
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.textContent);
                    var matched = true;
                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (type && normalize(card.getAttribute("data-type")) !== type) {
                        matched = false;
                    }
                    if (region && normalize(card.getAttribute("data-region")) !== region) {
                        matched = false;
                    }
                    if (year && normalize(card.getAttribute("data-year")) !== year) {
                        matched = false;
                    }
                    card.classList.toggle("is-hidden", !matched);
                });
            }
            [searchInput, typeInput, regionInput, yearInput].forEach(function (input) {
                if (input) {
                    input.addEventListener("input", apply);
                    input.addEventListener("change", apply);
                }
            });
        });
    }

    function loadVideo(video, source, overlay) {
        if (!video || !source) {
            return;
        }
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var current = video.getAttribute("data-loaded-src");
        if (current !== source) {
            video.setAttribute("data-loaded-src", source);
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                if (video.hlsInstance) {
                    video.hlsInstance.destroy();
                }
                var hls = new window.Hls({ enableWorker: true });
                video.hlsInstance = hls;
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        var playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === "function") {
            playAttempt.catch(function () {});
        }
    }

    function setupPlayers() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        boxes.forEach(function (box) {
            var video = box.querySelector("video");
            var overlay = box.querySelector("[data-play-button]");
            var source = box.getAttribute("data-video-src");
            if (overlay) {
                overlay.addEventListener("click", function () {
                    loadVideo(video, source, overlay);
                });
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!video.getAttribute("data-loaded-src")) {
                        loadVideo(video, source, overlay);
                    }
                });
            }
        });
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
