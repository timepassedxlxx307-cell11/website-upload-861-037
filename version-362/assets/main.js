(function () {
    function closestFormRoot(form) {
        return form.getAttribute("data-root") || "./";
    }

    function applyQueryToSearchInputs() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        var inputs = document.querySelectorAll("[data-search-input], [data-card-filter]");
        inputs.forEach(function (input) {
            if (input.hasAttribute("data-search-input") || document.body.contains(input)) {
                input.value = q;
            }
        });
        if (q) {
            filterCards(q);
        }
    }

    function setupMenus() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (!value) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                window.location.href = closestFormRoot(form) + "search.html?q=" + encodeURIComponent(value);
            });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        if (!slides.length) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        var timer;
        function show(next) {
            slides[index].classList.remove("is-active");
            if (dots[index]) {
                dots[index].classList.remove("is-active");
            }
            index = (next + slides.length) % slides.length;
            slides[index].classList.add("is-active");
            if (dots[index]) {
                dots[index].classList.add("is-active");
            }
        }
        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        start();
    }

    function filterCards(value) {
        var text = (value || "").trim().toLowerCase();
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-text]"));
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = card.getAttribute("data-filter-text") || "";
            var match = !text || haystack.indexOf(text) !== -1;
            card.style.display = match ? "" : "none";
            if (match) {
                visible += 1;
            }
        });
        document.querySelectorAll("[data-empty-state]").forEach(function (node) {
            node.classList.toggle("is-visible", visible === 0 && cards.length > 0);
        });
    }

    function setupFiltering() {
        document.querySelectorAll("[data-card-filter]").forEach(function (input) {
            input.addEventListener("input", function () {
                filterCards(input.value);
            });
        });
        document.querySelectorAll("[data-chip]").forEach(function (chip) {
            chip.addEventListener("click", function () {
                document.querySelectorAll("[data-chip]").forEach(function (item) {
                    item.classList.remove("is-active");
                });
                chip.classList.add("is-active");
                var value = chip.getAttribute("data-chip") || chip.textContent || "";
                var input = document.querySelector("[data-card-filter]");
                if (input) {
                    input.value = value;
                }
                filterCards(value);
            });
        });
    }

    window.bindMoviePlayer = function (sourceUrl) {
        var video = document.getElementById("player");
        var button = document.getElementById("playButton");
        var shell = document.querySelector("[data-player-shell]");
        if (!video || !sourceUrl) {
            return;
        }
        var loaded = false;
        var hlsInstance = null;
        function loadSource() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new Hls({ enableWorker: true });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }
        function playVideo() {
            loadSource();
            if (button) {
                button.classList.add("is-hidden");
            }
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }
        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                playVideo();
            });
        }
        if (shell) {
            shell.addEventListener("click", function (event) {
                if (event.target === shell) {
                    playVideo();
                }
            });
        }
        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenus();
        setupSearchForms();
        setupHero();
        setupFiltering();
        applyQueryToSearchInputs();
    });
})();
