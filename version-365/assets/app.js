(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupHeader() {
    var toggle = document.querySelector(".mobile-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function() {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "×" : "☰";
    });
  }

  function setupHero() {
    var carousel = document.getElementById("heroCarousel");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector(".hero-prev");
    var next = carousel.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        play();
      });
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
        play();
      });
    });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", play);
    play();
  }

  function setupFilters() {
    var input = document.querySelector(".filter-input");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-grid .movie-card"));
    var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    if (!cards.length) {
      return;
    }
    var activeFilter = "all";

    function readCard(card) {
      return [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-type") || "",
        card.getAttribute("data-genre") || "",
        card.getAttribute("data-year") || "",
        card.getAttribute("data-category") || "",
        card.textContent || ""
      ].join(" ").toLowerCase();
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function(card) {
        var haystack = readCard(card);
        var filterOk = activeFilter === "all" || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
        var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle("hidden-card", !(filterOk && keywordOk));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    chips.forEach(function(chip) {
      chip.addEventListener("click", function() {
        chips.forEach(function(item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        activeFilter = chip.getAttribute("data-filter") || "all";
        apply();
      });
    });
  }

  function getQuery(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function(ch) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[ch];
    });
  }

  function cardHtml(item) {
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"" + escapeHtml(item.file) + "\">" +
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"card-badge\">" + escapeHtml(item.type) + "</span>" +
      "<span class=\"card-year\">" + escapeHtml(item.year) + "</span>" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<div class=\"card-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.genre) + "</span></div>" +
      "<h3><a href=\"" + escapeHtml(item.file) + "\">" + escapeHtml(item.title) + "</a></h3>" +
      "<p>" + escapeHtml(item.oneLine) + "</p>" +
      "<div class=\"tag-row\"><span>" + escapeHtml(item.category) + "</span></div>" +
      "</div>" +
      "</article>";
  }

  function setupSearchPage() {
    var results = document.getElementById("searchResults");
    var summary = document.getElementById("searchSummary");
    var input = document.getElementById("searchInput");
    if (!results || !summary || typeof SEARCH_INDEX === "undefined") {
      return;
    }
    var q = getQuery("q").trim();
    if (input && q) {
      input.value = q;
    }
    if (!q) {
      return;
    }
    var lowered = q.toLowerCase();
    var found = SEARCH_INDEX.filter(function(item) {
      return [item.title, item.region, item.type, item.genre, item.year, item.category, item.tags].join(" ").toLowerCase().indexOf(lowered) !== -1;
    }).slice(0, 120);
    summary.textContent = found.length ? "搜索结果" : "没有找到相关影片";
    results.innerHTML = found.length ? found.map(cardHtml).join("") : "";
  }

  window.initMoviePlayer = function(videoId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !sourceUrl) {
      return;
    }
    var loaded = false;
    var hls = null;

    function load() {
      if (loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
      loaded = true;
    }

    function start() {
      load();
      overlay.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function() {});
      }
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function() {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function() {
      overlay.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function() {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  ready(function() {
    setupHeader();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
