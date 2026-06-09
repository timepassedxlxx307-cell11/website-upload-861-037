(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var header = document.querySelector("[data-header]");
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    function updateHeader() {
      if (!header) {
        return;
      }
      if (window.scrollY > 18) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (menuButton && mobileNav && header) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
        header.classList.toggle("menu-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function startHero() {
        stopHero();
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      function stopHero() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          startHero();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          startHero();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
          startHero();
        });
      });

      hero.addEventListener("mouseenter", stopHero);
      hero.addEventListener("mouseleave", startHero);
      showSlide(0);
      startHero();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var regionFilter = document.querySelector("[data-filter-region]");
    var yearFilter = document.querySelector("[data-filter-year]");
    var categoryFilter = document.querySelector("[data-filter-category]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function cardText(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-category"),
        card.textContent
      ].join(" "));
    }

    function applyFilters(sourceInput) {
      var query = sourceInput ? sourceInput.value : (searchInputs[0] ? searchInputs[0].value : "");
      searchInputs.forEach(function (input) {
        if (input !== sourceInput && input.value !== query) {
          input.value = query;
        }
      });

      var q = normalize(query);
      var region = normalize(regionFilter ? regionFilter.value : "");
      var year = normalize(yearFilter ? yearFilter.value : "");
      var category = normalize(categoryFilter ? categoryFilter.value : "");

      cards.forEach(function (card) {
        var text = cardText(card);
        var visible = true;
        if (q && text.indexOf(q) === -1) {
          visible = false;
        }
        if (region && normalize(card.getAttribute("data-region")).indexOf(region) === -1) {
          visible = false;
        }
        if (year && normalize(card.getAttribute("data-year")).indexOf(year) === -1) {
          visible = false;
        }
        if (category && normalize(card.getAttribute("data-category")).indexOf(category) === -1) {
          visible = false;
        }
        card.classList.toggle("is-filtered-out", !visible);
      });
    }

    searchInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        applyFilters(input);
      });
    });

    [regionFilter, yearFilter, categoryFilter].forEach(function (select) {
      if (select) {
        select.addEventListener("change", function () {
          applyFilters(null);
        });
      }
    });

    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (video) {
      var src = video.getAttribute("data-video");
      var card = video.closest(".player-card");
      var overlay = card ? card.querySelector("[data-play-trigger]") : null;
      var loaded = false;
      var hls = null;

      function mountSource() {
        if (loaded || !src) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
        loaded = true;
      }

      function startPlayer() {
        mountSource();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", startPlayer);
      }

      video.addEventListener("click", function () {
        if (!loaded) {
          startPlayer();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  });
})();
