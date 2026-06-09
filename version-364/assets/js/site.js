(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="movie-cover" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="movie-play">▶</span>',
      '<span class="movie-score">★ ' + escapeHtml(movie.rating) + '</span>',
      '</a>',
      '<div class="movie-info">',
      '<div class="movie-tags">' + tags + '</div>',
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine || '') + '</p>',
      '<div class="movie-meta">',
      '<span>' + escapeHtml(movie.region || '') + '</span>',
      '<span>' + escapeHtml(movie.year || '') + '</span>',
      '<span>' + escapeHtml(movie.duration || '') + '</span>',
      '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initMobileMenu() {
    var button = qs('[data-menu-button]');
    var menu = qs('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHeaderSearch() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        var query = input ? input.value.trim() : '';
        if (!query) {
          event.preventDefault();
          window.location.href = 'search.html';
        }
      });
    });
  }

  function initHero() {
    var root = qs('[data-hero-slider]');
    if (!root) {
      return;
    }
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    start();
  }

  function initCardFilters() {
    qsa('[data-card-filter]').forEach(function (bar) {
      var section = bar.closest('.content-section') || document;
      var list = qs('[data-filter-list]', section);
      var textInput = qs('[data-filter-text]', bar);
      var yearSelect = qs('[data-filter-year]', bar);
      var resetButton = qs('[data-filter-reset]', bar);
      if (!list) {
        return;
      }
      var cards = qsa('.movie-card', list);

      function filter() {
        var keyword = textInput ? textInput.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-type'),
            card.textContent
          ].join(' ').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var matched = (!keyword || haystack.indexOf(keyword) !== -1) && (!year || cardYear === year);
          card.classList.toggle('is-filter-hidden', !matched);
        });
      }

      if (textInput) {
        textInput.addEventListener('input', filter);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', filter);
      }
      if (resetButton) {
        resetButton.addEventListener('click', function () {
          if (textInput) {
            textInput.value = '';
          }
          if (yearSelect) {
            yearSelect.value = '';
          }
          filter();
        });
      }
    });
  }

  function initSearchPage() {
    var app = qs('[data-search-app]');
    if (!app || !window.MOVIE_INDEX) {
      return;
    }
    var input = qs('[data-search-input]', app);
    var typeSelect = qs('[data-search-type]', app);
    var button = qs('[data-search-button]', app);
    var count = qs('[data-search-count]', app);
    var results = qs('[data-search-results]', app);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function render() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var matched = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' ').toLowerCase();
        var textOk = !keyword || haystack.indexOf(keyword) !== -1;
        var typeOk = !type || String(movie.type).indexOf(type) !== -1 || String(movie.genre).indexOf(type) !== -1;
        return textOk && typeOk;
      }).slice(0, 240);

      if (count) {
        count.textContent = matched.length ? '已显示 ' + matched.length + ' 个匹配结果。' : '没有找到匹配影片，请更换关键词。';
      }
      if (results) {
        results.innerHTML = matched.map(createCard).join('');
      }
    }

    if (button) {
      button.addEventListener('click', render);
    }
    if (input) {
      input.addEventListener('input', render);
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          render();
        }
      });
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', render);
    }
    if (initial) {
      render();
    }
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('[data-play-button]', player);
      var message = qs('[data-player-message]', player);
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute('data-video-src');
      var hlsInstance = null;

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function playVideo() {
        button.classList.add('is-hidden');
        setMessage('正在加载播放源...');
        if (!source) {
          setMessage('播放源暂不可用。');
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage('');
            video.play().catch(function () {
              setMessage('请再次点击播放器开始播放。');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('播放加载失败，请刷新页面后重试。');
              if (hlsInstance) {
                hlsInstance.destroy();
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setMessage('');
            video.play().catch(function () {
              setMessage('请再次点击播放器开始播放。');
            });
          }, { once: true });
        } else {
          setMessage('当前浏览器不支持 HLS 播放。');
        }
      }

      button.addEventListener('click', playVideo);
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeaderSearch();
    initHero();
    initCardFilters();
    initSearchPage();
    initPlayers();
  });
}());
