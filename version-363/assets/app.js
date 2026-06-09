(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  document.querySelectorAll(".site-search-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      if (!input || !input.value.trim()) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-slide") || "0"));
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var filterInput = document.getElementById("pageFilter");
  var filterGrid = document.getElementById("filterGrid");

  if (filterInput && filterGrid) {
    filterInput.addEventListener("input", function () {
      var value = filterInput.value.trim().toLowerCase();
      filterGrid.querySelectorAll(".movie-card").forEach(function (card) {
        var content = card.getAttribute("data-search") || "";
        card.hidden = value && content.indexOf(value) === -1;
      });
    });
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function createResultCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "<article class=\"movie-card movie-card-search\">" +
      "<a class=\"card-cover\" href=\"" + movie.file + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"card-score\">" + escapeHtml(movie.rating) + "</span>" +
      "<span class=\"card-play\">▶</span>" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<h3><a href=\"" + movie.file + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  var searchResults = document.getElementById("searchResults");
  var searchInput = document.getElementById("searchInput");
  var searchTitle = document.getElementById("searchTitle");

  if (searchResults && window.SITE_MOVIES) {
    var query = readQuery();
    if (searchInput) {
      searchInput.value = query;
    }
    var normalized = query.toLowerCase();
    var results = normalized
      ? window.SITE_MOVIES.filter(function (movie) {
          return movie.search.indexOf(normalized) !== -1;
        }).slice(0, 120)
      : window.SITE_MOVIES.slice(0, 36);

    if (searchTitle) {
      searchTitle.textContent = normalized ? "搜索结果" : "热门影片";
    }

    searchResults.innerHTML = results.length
      ? results.map(createResultCard).join("")
      : "<p class=\"empty-state\">没有找到相关影片</p>";
  }
})();

function initMoviePlayer(videoId, sourceUrl, posterUrl, overlayId) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var hlsInstance = null;
  var ready = false;

  if (!video) {
    return;
  }

  if (posterUrl) {
    video.setAttribute("poster", posterUrl);
  }

  function startPlayback() {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  function loadAndPlay() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    if (ready) {
      startPlayback();
      return;
    }

    ready = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      video.addEventListener("loadedmetadata", startPlayback, { once: true });
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, startPlayback);
      return;
    }

    video.src = sourceUrl;
    video.addEventListener("loadedmetadata", startPlayback, { once: true });
    video.load();
  }

  if (overlay) {
    overlay.addEventListener("click", loadAndPlay);
  }

  video.addEventListener("click", function () {
    if (!ready || video.paused) {
      loadAndPlay();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
