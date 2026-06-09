(function () {
    var header = document.querySelector("[data-site-header]");
    var navToggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 10) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    if (navToggle && mobileNav) {
        navToggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();

    document.querySelectorAll("[data-search-input]").forEach(function (input) {
        var container = input.closest("section") || document;
        var scope = container.querySelector("[data-search-scope]") || document;
        var empty = container.querySelector("[data-empty-state]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

        input.addEventListener("input", function () {
            var keyword = input.value.trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
                var matched = !keyword || text.indexOf(keyword) !== -1;
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        });
    });

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var thumbs = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-thumb]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle("is-active", thumbIndex === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }

        thumbs.forEach(function (thumb) {
            thumb.addEventListener("click", function () {
                var thumbIndex = parseInt(thumb.getAttribute("data-hero-thumb"), 10);
                if (!Number.isNaN(thumbIndex)) {
                    show(thumbIndex);
                    play();
                }
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", play);
        show(0);
        play();
    });
}());
