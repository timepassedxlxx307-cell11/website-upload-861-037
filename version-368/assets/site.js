function setupMobileNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("mobileNav");

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener("click", function () {
        var isOpen = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
    });
}

function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
        return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === current);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            var index = Number(dot.getAttribute("data-hero-dot"));
            show(index);
            start();
        });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);

    if (slides.length > 1) {
        start();
    }
}

function setupMovieFiltering() {
    var input = document.getElementById("movieSearch");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    var emptyState = document.querySelector("[data-empty-state]");
    var activeFilter = "all";

    if (!input && chips.length === 0) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");

    if (initial && input) {
        input.value = initial;
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function cardMatchesFilter(card, filter) {
        if (filter === "all") {
            return true;
        }

        var haystack = normalize(card.getAttribute("data-search"));
        return haystack.indexOf(normalize(filter)) !== -1;
    }

    function apply() {
        var query = input ? normalize(input.value) : "";
        var shown = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-search"));
            var matchesQuery = query === "" || haystack.indexOf(query) !== -1;
            var matchesChip = cardMatchesFilter(card, activeFilter);
            var visible = matchesQuery && matchesChip;

            card.style.display = visible ? "" : "none";

            if (visible) {
                shown += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("show", shown === 0);
        }
    }

    if (input) {
        input.addEventListener("input", apply);
    }

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            activeFilter = chip.getAttribute("data-filter") || "all";
            chips.forEach(function (item) {
                item.classList.toggle("active", item === chip);
            });
            apply();
        });
    });

    apply();
}

function startMoviePlayer(videoUrl) {
    var shell = document.querySelector("[data-player-shell]");
    var video = document.querySelector("[data-player-video]");
    var button = document.querySelector("[data-player-start]");
    var attached = false;
    var hls = null;

    if (!shell || !video || !videoUrl) {
        return;
    }

    function attach() {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
            return;
        }

        video.src = videoUrl;
    }

    function play() {
        attach();
        shell.classList.add("is-playing");
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                shell.classList.remove("is-playing");
            });
        }
    }

    if (button) {
        button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener("play", function () {
        shell.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
            shell.classList.remove("is-playing");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}

window.startMoviePlayer = startMoviePlayer;

document.addEventListener("DOMContentLoaded", function () {
    setupMobileNavigation();
    setupHeroSlider();
    setupMovieFiltering();
});
